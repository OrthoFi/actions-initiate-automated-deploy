import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import {context} from '@actions/github'
import {OctokitResponse} from '@octokit/types'

async function run(): Promise<void> {
  try {
    const branch = core
      .getInput('branch', {required: true})
      .replace('refs/heads/', '')

    let environments: string[] = []
    switch (branch) {
      case 'main':
      case 'master':
        environments = ['production', 'demo']
        break
      case 'risk':
      case 'regression':
        environments = ['risk']
        break
      case 'dev':
        environments = ['dev']
      default:
        environments = [branch]
        break
    }

    const token = core.getInput('token', {required: true})
    const octokit = new Octokit({auth: token})

    const {owner, repo} = context.repo

    const workflow_id = core.getInput('workflow')
    const ref = branch

    for (const environment of environments) {
      const inputs = {
        environment: environment
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

      if (res.status !== 204) {
        core.setFailed(
          `Deployment to ${environment} failed. Message: ${res.data}`
        )
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
