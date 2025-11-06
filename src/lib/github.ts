#!/usr/bin/env node
import inquirer from 'inquirer';
import ora from 'ora';
import { Octokit } from '@octokit/rest';
import { RequestError } from '@octokit/request-error';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '@/utils/logger';
import { PublicError } from '@/utils/errors';
import { GithubLabel, PullRequestDetails, PullRequestFile, IssueDetails } from '@/types';
import defaultLabels from '../labels/default.json';

// Get the directory of the current module (works with ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

class GitHubManager {
  public _octokit: Octokit;

  constructor(token?: string) {
    const githubToken = token || process.env.GITHUB_TOKEN;

    if (!githubToken) {
      throw new PublicError(
        'GitHub token is required. Please provide a token or set GITHUB_TOKEN environment variable.'
      );
    }

    this._octokit = new Octokit({ auth: githubToken });
  }

  public async ensureToken(): Promise<void> {
    // This method is kept for backward compatibility with tests
    // In the current implementation, token is required in the constructor
    return;
  }

  public get octokit(): Octokit {
    return this._octokit;
  }

  /**
   * Get all label files from the src/labels directory
   */
  private async getLabelFiles(): Promise<string[]> {
    // Use __dirname to get path relative to this file, not process.cwd()
    const labelsDir = path.join(__dirname, '..', 'labels');

    if (!fs.existsSync(labelsDir)) {
      return ['default'];
    }

    try {
      const files = fs
        .readdirSync(labelsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));

      return files.length ? files : ['default'];
    } catch (error) {
      logger.warning(
        `Failed to read label files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return ['default'];
    }
  }

  /**
   * Select a label file to use
   */
  private async selectLabelFile(): Promise<string> {
    const labelFiles = await this.getLabelFiles();

    if (labelFiles.length === 1) {
      return labelFiles[0];
    }

    const { selectedFile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: 'Select a label template:',
        choices: labelFiles.map(file => ({
          name: file === 'default' ? `${file} (default template)` : file,
          value: file,
        })),
      },
    ]);

    return selectedFile;
  }

  /**
   * Load labels from the selected JSON file
   */
  async getLabelsFromJSON(): Promise<GithubLabel[]> {
    try {
      const selectedFile = await this.selectLabelFile();

      if (selectedFile === 'default') {
        return defaultLabels as GithubLabel[];
      }

      const filePath = path.join(__dirname, '..', 'labels', `${selectedFile}.json`);

      if (!fs.existsSync(filePath)) {
        logger.warning(`File ${filePath} does not exist, using default labels.`);
        return defaultLabels as GithubLabel[];
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) as GithubLabel[];
    } catch (error) {
      logger.warning(
        `Failed to load labels from file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return defaultLabels as GithubLabel[];
    }
  }

  async getLabelsFromRepo(repoFullName: string): Promise<GithubLabel[]> {
    try {
      const spinner = ora(`Fetching labels from repository: ${repoFullName} ...`).start();
      const [owner, repo] = repoFullName.split('/');

      const { data: labels } = await this.octokit.issues.listLabelsForRepo({
        owner,
        repo,
        per_page: 100,
      });

      spinner.succeed('Labels fetched successfully!');

      // Map data to include only name, color and description
      return labels.map(label => ({
        name: label.name,
        color: label.color,
        description: label.description || '',
      }));
    } catch (error) {
      throw new PublicError(
        `Failed to fetch labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async selectLabels(): Promise<GithubLabel[]> {
    const labels = await this.getLabelsFromJSON();

    const { selectedLabels } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedLabels',
        message: 'Select labels to add:',
        choices: labels.map(label => ({
          name: `${label.name} - ${label.description}`,
          value: label,
        })),
      },
    ]);

    if (selectedLabels.length === 0) {
      throw new PublicError('No labels were selected.');
    }

    return selectedLabels;
  }

  async selectLabelsToRemove(repoFullName: string): Promise<string[]> {
    try {
      const labels = await this.getLabelsFromRepo(repoFullName);

      const { selectedLabels } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedLabels',
          message: 'Select labels to remove:',
          choices: labels.map(label => ({
            name: `${label.name} - ${label.description}`,
            value: label.name,
          })),
        },
      ]);

      if (selectedLabels.length === 0) {
        throw new PublicError('No labels were selected for removal.');
      }

      return selectedLabels;
    } catch (error) {
      throw new PublicError(
        `Failed to select labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async selectRepository(): Promise<string> {
    const spinner = ora(`Fetching repositories ...`).start();
    const { data: repos } = await this.octokit.repos.listForAuthenticatedUser();

    spinner.succeed('Repositories fetched successfully!');

    if (repos.length === 0) {
      throw new PublicError('No repositories found.');
    }

    const { selectedRepo } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedRepo',
        message: 'Select a repository:',
        choices: repos.map(repo => ({
          name: repo.full_name,
          value: repo.full_name,
        })),
      },
    ]);

    return selectedRepo;
  }

  async addLabels(repoFullName: string): Promise<void> {
    try {
      logger.info(`Adding labels to repository: ${repoFullName}\n`);

      const selectedLabels = await this.selectLabels();
      const [owner, repo] = repoFullName.split('/');

      for (const label of selectedLabels) {
        try {
          await this.octokit.issues.createLabel({
            owner,
            repo,
            name: label.name,
            color: label.color,
            description: label.description,
          });

          logger.success(`Label "${label.name}" added successfully!`);
        } catch (error: unknown) {
          if (error instanceof RequestError) {
            if (error.status === 422) {
              logger.warning(`Label "${label.name}" already exists. Skipping...`);
              continue;
            }

            logger.error(`GitHub API error (${error.status}): ${error.message}`);
          } else {
            logger.error(
              `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }
    } catch (error: unknown) {
      throw new PublicError(
        `Failed to add labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async removeLabels(repoFullName: string): Promise<void> {
    try {
      logger.info(`Removing labels from repository: ${repoFullName}\n`);

      const selectedLabels = await this.selectLabelsToRemove(repoFullName);
      const [owner, repo] = repoFullName.split('/');

      for (const labelName of selectedLabels) {
        try {
          await this.octokit.issues.deleteLabel({
            owner,
            repo,
            name: labelName,
          });

          logger.success(`Label "${labelName}" removed successfully!`);
        } catch (error: unknown) {
          if (error instanceof RequestError) {
            if (error.status === 404) {
              logger.warning(`Label "${labelName}" not found. Skipping...`);
              continue;
            }

            logger.error(`GitHub API error (${error.status}): ${error.message}`);
          } else {
            logger.error(
              `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }
    } catch (error: unknown) {
      throw new PublicError(
        `Failed to remove labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get open pull requests from a repository
   * @param repoFullName Full name of the repository (owner/repo)
   * @returns List of pull requests
   */
  async getPullRequests(repoFullName: string): Promise<any[]> {
    try {
      const spinner = ora(`Fetching pull requests from repository: ${repoFullName} ...`).start();
      const [owner, repo] = repoFullName.split('/');

      const { data: pullRequests } = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 100,
      });

      spinner.succeed();
      logger.success('Pull requests fetched successfully!');

      return pullRequests;
    } catch (error: unknown) {
      if (error instanceof RequestError) {
        throw new PublicError(`GitHub API error (${error.status}): ${error.message}`);
      }
      throw new PublicError(
        `Failed to fetch pull requests: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get detailed information about a pull request
   * @param repoFullName Full name of the repository (owner/repo)
   * @param pullNumber Pull request number
   * @returns Detailed information about the pull request
   */
  async getPullRequestDetails(
    repoFullName: string,
    pullNumber: number
  ): Promise<PullRequestDetails> {
    try {
      const [owner, repo] = repoFullName.split('/');

      // Get PR information
      const { data: pr } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });

      // Get files changed in PR
      const { data: files } = await this.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
      });

      // Convert files to our format
      const formattedFiles: PullRequestFile[] = files.map(file => ({
        name: file.filename,
        status: file.status as 'added' | 'modified' | 'removed',
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
      }));

      return {
        title: pr.title,
        description: pr.body || '',
        files: formattedFiles,
        repo: repoFullName,
      };
    } catch (error: unknown) {
      if (error instanceof RequestError) {
        throw new PublicError(`GitHub API error (${error.status}): ${error.message}`);
      }
      throw new PublicError(
        `Failed to fetch pull request details: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Add labels to a pull request
   * @param repoFullName Full name of the repository (owner/repo)
   * @param pullNumber Pull request number
   * @param labels Array of label names to add
   */
  async addLabelsToPullRequest(
    repoFullName: string,
    pullNumber: number,
    labels: string[]
  ): Promise<void> {
    try {
      const [owner, repo] = repoFullName.split('/');

      await this.octokit.issues.addLabels({
        owner,
        repo,
        issue_number: pullNumber,
        labels,
      });

      logger.success(`Labels added to pull request #${pullNumber}`);
    } catch (error: unknown) {
      if (error instanceof RequestError) {
        throw new PublicError(`GitHub API error (${error.status}): ${error.message}`);
      }
      throw new PublicError(
        `Failed to add labels to pull request: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Updates a pull request with new description and/or labels
   */
  async updatePullRequest(
    repoFullName: string,
    pullNumber: number,
    updates: {
      body?: string;
      labels?: string[];
    }
  ): Promise<void> {
    try {
      const [owner, repo] = repoFullName.split('/');

      // Only update PR description if body is provided
      if (updates.body !== undefined) {
        await this.octokit.pulls.update({
          owner,
          repo,
          pull_number: pullNumber,
          body: updates.body,
        });
      }

      if (updates.labels) {
        await this.octokit.issues.setLabels({
          owner,
          repo,
          issue_number: pullNumber,
          labels: updates.labels,
        });
      }
    } catch (error) {
      throw new PublicError(
        `Failed to update pull request: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get open issues from a repository
   * @param repoFullName Full name of the repository (owner/repo)
   * @returns List of issues
   */
  async getIssues(repoFullName: string): Promise<any[]> {
    try {
      const spinner = ora(`Fetching issues from repository: ${repoFullName} ...`).start();
      const [owner, repo] = repoFullName.split('/');

      const { data: issues } = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 100,
      });

      // Filter out pull requests (GitHub API returns PRs as issues)
      const filteredIssues = issues.filter(issue => !issue.pull_request);

      spinner.succeed();
      logger.success('Issues fetched successfully!');

      return filteredIssues;
    } catch (error: unknown) {
      if (error instanceof RequestError) {
        throw new PublicError(`GitHub API error (${error.status}): ${error.message}`);
      }
      throw new PublicError(
        `Failed to fetch issues: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get detailed information about an issue
   * @param repoFullName Full name of the repository (owner/repo)
   * @param issueNumber Issue number
   * @returns Detailed information about the issue
   */
  async getIssueDetails(repoFullName: string, issueNumber: number): Promise<IssueDetails> {
    try {
      const [owner, repo] = repoFullName.split('/');

      // Get issue information
      const { data: issue } = await this.octokit.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      });

      return {
        title: issue.title,
        description: issue.body || '',
        repo: repoFullName,
        state: issue.state as 'open' | 'closed',
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      };
    } catch (error: unknown) {
      if (error instanceof RequestError) {
        throw new PublicError(`GitHub API error (${error.status}): ${error.message}`);
      }
      throw new PublicError(
        `Failed to fetch issue details: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Updates an issue with new description and/or labels
   * @param repoFullName Full name of the repository (owner/repo)
   * @param issueNumber Issue number
   * @param updates Object containing optional body and labels to update
   */
  async updateIssue(
    repoFullName: string,
    issueNumber: number,
    updates: {
      body?: string;
      labels?: string[];
    }
  ): Promise<void> {
    try {
      const [owner, repo] = repoFullName.split('/');

      // Only update issue description if body is provided
      if (updates.body !== undefined) {
        await this.octokit.issues.update({
          owner,
          repo,
          issue_number: issueNumber,
          body: updates.body,
        });
      }

      if (updates.labels) {
        await this.octokit.issues.setLabels({
          owner,
          repo,
          issue_number: issueNumber,
          labels: updates.labels,
        });
      }
    } catch (error) {
      throw new PublicError(
        `Failed to update issue: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export { GitHubManager };
