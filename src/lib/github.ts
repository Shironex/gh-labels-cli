import path from "path";
import fs from "fs";
import inquirer from "inquirer";
import ora from "ora";
import { Octokit } from "@octokit/rest";
import { RequestError } from "@octokit/request-error";
import { config } from "dotenv";
import { logger } from "@/utils/logger";
import { PublicError } from "@/utils/errors";
import { GithubLabel } from "@/types";

config();

class GitHubManager {
  public _octokit: Octokit;

  constructor(token?: string) {
    const githubToken = token || process.env.GITHUB_TOKEN;

    if (!githubToken) {
      logger.error("GitHub token is required.");
      process.exit(1);
    }

    this._octokit = new Octokit({ auth: githubToken });
  }

  public get octokit(): Octokit {
    return this._octokit;
  }

  async getLabelsFromJSON(): Promise<GithubLabel[]> {
    try {
      const filePath = path.join(__dirname, "../json/labels.json");
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      throw new PublicError("Failed to load labels from labels.json.");
    }
  }

  async selectLabels(): Promise<GithubLabel[]> {
    const labels = await this.getLabelsFromJSON();

    const { selectedLabels } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedLabels",
        message: "Select labels to add:",
        choices: labels.map((label) => ({
          name: `${label.name} - ${label.description}`,
          value: label,
        })),
      },
    ]);

    if (selectedLabels.length === 0) {
      throw new PublicError("No labels were selected.");
    }

    return selectedLabels;
  }

  async selectRepository(): Promise<string> {
    const spinner = ora(`Fetching repositories ...`).start();
    const { data: repos } = await this.octokit.repos.listForAuthenticatedUser();

    spinner.succeed();
    logger.success("Done!");

    if (repos.length === 0) {
      throw new PublicError("No repositories found.");
    }

    const { selectedRepo } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedRepo",
        message: "Select a repository:",
        choices: repos.map((repo) => ({
          name: repo.full_name,
          value: repo.full_name,
        })),
      },
    ]);

    return selectedRepo;
  }

  async addLabels(repoFullName: string): Promise<void> {
    try {
      logger.info(`📌 Adding labels to repository: ${repoFullName}\n`);

      const selectedLabels = await this.selectLabels();
      const [owner, repo] = repoFullName.split("/");

      for (const label of selectedLabels) {
        try {
          await this.octokit.issues.createLabel({
            owner,
            repo,
            name: label.name,
            color: label.color,
            description: label.description,
          });

          logger.success(`✅ Label "${label.name}" added successfully!`);
        } catch (error: any) {
          if (error instanceof RequestError) {
            if (error.status === 422) {
              logger.warning(
                `⚠️ Label "${label.name}" already exists. Skipping...`
              );
              return;
            }
            
            logger.error(
              `❌ GitHub API error (${error.status}): ${error.message}`
            );
          } else {
            logger.error(
              `❌ Unexpected error: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        }
      }
    } catch (error: unknown) {
      throw new PublicError(
        `Failed to add labels: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

export { GitHubManager };
