import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import {context} from '@actions/github'
import {OctokitResponse} from '@octokit/types'

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

    const {owner, repo} = context.repo

    const workflow_id = core.getInput('workflow')
    const ref = branch
    const inputs = {
      environment: environmentName
    }

    core.info(`Deploying to ${environmentName}`)
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

    if (res.status !== 204) {
      core.setFailed(
        `Deployment to ${environmentName} failed. Message: ${res.data}`
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
