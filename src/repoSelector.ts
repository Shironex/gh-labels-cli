import inquirer from "inquirer";
import { Octokit } from "@octokit/rest";
import ora from 'ora';
import { logError, logSuccess } from './utils/logger';

export async function selectRepository(octokit: Octokit): Promise<string> {
  try {
    const spinner = ora(`Fetching repositories ...`).start();

    const { data: repos } = await octokit.repos.listForAuthenticatedUser();

    spinner.succeed();
    logSuccess("Done!")

    if (repos.length === 0) {
      console.log("No repositories found.");
      process.exit(1);
    }

    const { selectedRepo } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedRepo",
        message: "Select a repository:",
        choices: repos.map(repo => ({
          name: repo.full_name,
          value: repo.full_name
        }))
      }
    ]);

    return selectedRepo;
  } catch (error: any) {
    logError("Error fetching repositories: " + error.message);
    process.exit(1);
  }
}
