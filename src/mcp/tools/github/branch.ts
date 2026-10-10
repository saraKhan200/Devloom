import { getOctokit } from "./client.js";

export async function createBranch(
  owner: string,
  repo: string,
  newBranchName: string,
  baseBranch: string = "main",
  token?: string,
) {
  const octokit = getOctokit(token);
  // 1. Get the latest commit SHA from the base branch (e.g. main)
  const { data: baseRef } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });

  const baseSha = baseRef.object.sha;

  // 2. Create the new ref (branch) pointing to that same commit SHA
  const { data: newRef } = await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${newBranchName}`,
    sha: baseSha,
  });

  return `Branch '${newBranchName}' created successfully from ${baseBranch} (${baseSha.substring(0, 7)})`;
}

export async function listBranches(
  owner: string,
  repo: string,
  token?: string,
) {
  const octokit = getOctokit(token);
  // 1. Get the latest commit SHA from the base branch (e.g. main)
  const data = await octokit.rest.repos.listBranches({
    owner,
    repo,
  });

  if (data?.status > 299) {
    return `Unknown error couldnt list branches , status - ${data?.status}`;
  }

  const branchSummary = data?.data
    .map((branch) => {
      return `branch  name - ${branch?.name},branch SHA - ${branch?.commit?.sha},commit URL - ${branch?.commit?.url}`;
    })
    .join(". \n");
  return `branches found for repo : \n ${branchSummary}`;
}
