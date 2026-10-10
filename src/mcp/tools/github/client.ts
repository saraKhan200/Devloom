import { Octokit } from "@octokit/rest";
import { type universalError } from "../../../schemas/universal.schemas.js";

// Returns an Octokit instance scoped to the current request's user token
export function getOctokit(userToken?: string): Octokit {
  const token = userToken || process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("Missing GitHub authentication token.");
  }

  return new Octokit({ auth: token });
}

/**
 *
 * @param error - the error Object
 * @param message - the mesaage you pass on , in context to where the issue is occureing
 * @param status -
 * @returns
 */
export function gitError(error: unknown, message: string) {
  const data: universalError = {
    content: [
      {
        type: "text",
        text: `${message}: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
    ],
    isError: true,
  };
  return data;
}
