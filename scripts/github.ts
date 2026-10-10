import "dotenv/config";
import { Octokit } from "@octokit/rest";
import * as search from "../src/mcp/tools/github/releases.js";

// // Pass your GitHub Personal Access Token
// const octokit = new Octokit({
//   auth: process.env.GITHUB_TOKEN,
// });

// below are the functions used

const res = await search.getTagReleases(
  "saraKhan200",
  "test1",
  "test1",
  process.env.GITHUB_TOKEN,
);
console.log(res);
