import { getOctokit } from "./client.js";

/**
 * used to create issue in a repo
 * @param owner - the owner of the repo
 * @param repo - the name of the repo
 * @param title - the title of the issue
 * @param body - the main body string of the issue
 * @param token - the auth token
 * @returns string
 */
export async function createIssues(
  owner: string,
  repo: string,
  title: string,
  body: string,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt make the issue,status:${data?.status},url:${data?.url} ${owner}/${repo}.`;
  }

  // Format array into a clean speech summary string for Alexa

  return `created issue at ${data?.data?.created_at},check - ${data?.data?.html_url}`;
}

/**
 * this function creates a comment on a issue OR a Pull request
 * @param owner - the ownr of the repo
 * @param repo - the name of the repo
 * @param mentioned - sort on basis if mentioned a specific string or person
 * @param creator - sort on basis of creator of the issue
 * @param token - the auth  token
 * @returns string
 */
export async function getIssues(
  owner: string,
  repo: string,
  mentioned?: string,
  creator?: string,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.issues.listForRepo({
    owner,
    repo,
    ...(mentioned ? { mentioned } : {}),
    ...(creator ? { creator } : {}),
  });

  if (data?.status > 299) {
    return `unknown error-couldnt make the issue,status:${data?.status},url:${data?.url} ${owner}/${repo}.`;
  }

  // Format array into a clean speech summary string for Alexa
  const issuesSummary = data?.data
    .map((item) => {
      return `${item?.number} ${item?.title} - ${item?.body} .check - ${item?.html_url} , ${item?.pull_request ? item?.pull_request : "no pull request with this issue"}`;
    })
    .join(". \n");
  return `issues - ${issuesSummary}`;
}

/**
 * this function creates a comment on a issue OR a Pull request
 * @param owner - the ownr of the repo
 * @param repo - the name of the repo
 * @param issueNumber - the issue number , this CAN be a Pull request  OR a issue bothdepending on the number
 * @param body - the body for the issue , main test
 * @param token - the auth  token
 * @returns string
 */
export async function createCommentOnIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
  token?: string,
): Promise<string> {
  const octokit = getOctokit(token);
  const data = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });

  if (data?.status > 299) {
    return `unknown error-couldnt make the issue,status:${data?.status},url:${data?.url} ${owner}/${repo}.`;
  }

  // Format array into a clean speech summary string for Alexa

  return `created issue comment at ${data?.data?.created_at},check - ${data?.data?.html_url}`;
}
