import * as core from '@actions/core'
import * as github from '@actions/github'

type DeploymentState =
  | 'error'
  | 'failure'
  | 'inactive'
  | 'in_progress'
  | 'queued'
  | 'pending'
  | 'success'

async function run() {
  try {
    const context = github.context
    const defaultUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}/checks`

    const token = core.getInput('token', {required: true})
    const url = core.getInput('target_url', {required: false}) || defaultUrl
    const description = core.getInput('description', {required: false}) || ''
    const deploymentId = core.getInput('deployment_id')
    const environmentUrl =
      core.getInput('environment_url', {required: false}) || ''
    const state = core.getInput('state') as DeploymentState

    const client = github.getOctokit(token, {
      previews: ['flash', 'ant-man'],
      log: console
    })

    const deployment = await client.rest.repos.createDeploymentStatus({
      ...context.repo,
      deployment_id: parseInt(deploymentId),
      state,
      log_url: url,
      description,
      environment_url: environmentUrl
    })
    console.log({deployment})
  } catch (error) {
    if (error instanceof Error) {
      core.error(error)
      core.setFailed(error.message)
    }
  }
}

run()
