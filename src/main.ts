import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'

async function run(): Promise<void> {
  try {
    const branch = core
      .getInput('branch', {required: true})
      .replace('refs/heads/', '')

    let environmentName = ''
    switch (branch) {
      case 'main':
      case 'master':
        environmentName = 'production'
        break
      case 'risk':
      case 'regression':
        environmentName = 'risk'
        break
      default:
        environmentName = branch
        break
    }
    core.info(`Setting target environment to ${environmentName}`)

    const token = core.getInput('token', {required: true})
    const octokit = new Octokit({auth: token})

    const [owner, repo] = (
      process.env.GITHUB_REPOSITORY ?? 'orthofi/repo-name-here'
    ).split('/')

    const workflow_id = 'deploy.yml'
    const ref = branch
    const inputs = {
      environment: environmentName
    }

    const res = await octokit.request(
      'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
      {
        owner,
        repo,
        workflow_id,
        ref,
        inputs
      }
    )

    if (res.status > 299) {
      core.setFailed(res.data)
    }

    if (environmentName === 'dev') {
      const additionalDeploymentEnvironments = ['thunder']

      const responses = additionalDeploymentEnvironments.map(
        async e =>
          await octokit.request(
            'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
            {
              owner,
              repo,
              workflow_id,
              ref,
              inputs: {
                environment: e
              }
            }
          )
      )

      const errors = responses
        .filter(async r => (await r).status > 299)
        .map(async r => (await r).data)

      if (!!errors) {
        core.setFailed(errors.join(', '))
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
