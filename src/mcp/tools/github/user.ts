import { getOctokit } from "./client.js";

export async function acceptRepoInvite(
  owner: string,
  repo: string,
  invitationId: number,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.repos.acceptInvitationForAuthenticatedUser({
    invitation_id: invitationId,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt accept the invitation for repo,status:${data?.status},url:${data?.url} ${owner}/${repo}.`;
  }

  // Format array into a clean speech summary string for Alexa

  return `${data?.status < 299 ? "successfully accepted repo invitation" : `Unknown status - ${data?.status},reccomended to check !!`}}`;
}

export async function createRepo(
  name: string,
  description: string,
  isPrivate: boolean,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.repos.createForAuthenticatedUser({
    name,
    description,
    private: isPrivate,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt make a new repo,status:${data?.status},url:${data?.url}.`;
  }

  // Format array into a clean speech summary string for Alexa

  return `${data?.status < 299 ? "successfully made a new repo " : `Unknown status - ${data?.status},reccomended to check !!`}}`;
}

/**
 * createsa fork for the authentiateduser , i maybe take some time to fork a repo
 * @param owner the owner of the repo
 * @param repo - the name of the repo
 * @param token - the ath token
 * @returns string
 */
export async function createfork(
  owner: string,
  repo: string,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.repos.createFork({
    owner,
    repo,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt make a new repo,status:${data?.status},url:${data?.url}.`;
  }

  // Format array into a clean speech summary string for Alexa

  return `${data?.status < 299 ? `successfully forked the repo ${data?.data?.name} - ${data?.data?.description}` : `Unknown status - ${data?.status},reccomended to check !!`}}`;
}
