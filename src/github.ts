import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import { logError } from './utils/logger';

config();

export function getGitHubClient(token?: string) {
  const githubToken = token || process.env.GITHUB_TOKEN;

  if (!githubToken) {
    logError("GitHub token is required.");
    process.exit(1);
  }

  return new Octokit({ auth: githubToken });
}
