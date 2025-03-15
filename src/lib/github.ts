#!/usr/bin/env node
import inquirer from 'inquirer';
import ora from 'ora';
import { Octokit } from '@octokit/rest';
import { RequestError } from '@octokit/request-error';
import { config } from 'dotenv';
import { logger } from '@/utils/logger';
import { PublicError } from '@/utils/errors';
import { GithubLabel } from '@/types';
import labelsData from '../json/labels.json';

config();

class GitHubManager {
  public _octokit: Octokit;

  constructor(token?: string) {
    const githubToken = token || process.env.GITHUB_TOKEN;
    logger.debug('Initializing GitHubManager');

    if (!githubToken) {
      logger.error('GitHub token is required.');
      process.exit(1);
    }

    this._octokit = new Octokit({ auth: githubToken });
    logger.debug('Octokit instance created successfully');
  }

  public async ensureToken(): Promise<void> {
    // This method is kept for backward compatibility with tests
    // In the current implementation, token is required in the constructor
    return;
  }

  public get octokit(): Octokit {
    return this._octokit;
  }

  async getLabelsFromJSON(): Promise<GithubLabel[]> {
    logger.debug('Loading labels from labels.json');
    try {
      return labelsData;
    } catch (error) {
      logger.debug(
        `Failed to load labels.json: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw new PublicError('Failed to load labels from labels.json.');
    }
  }

  async getLabelsFromRepo(repoFullName: string): Promise<GithubLabel[]> {
    logger.debug(`Fetching labels from repository: ${repoFullName}`);
    try {
      const spinner = ora(`Fetching labels from repository: ${repoFullName} ...`).start();
      const [owner, repo] = repoFullName.split('/');
      logger.debug(`Owner: ${owner}, Repo: ${repo}`);

      const { data: labels } = await this.octokit.issues.listLabelsForRepo({
        owner,
        repo,
        per_page: 100,
      });

      logger.debug(`Found ${labels.length} labels in repository`);
      spinner.succeed();
      logger.success('Labels fetched successfully!');

      // Mapowanie danych, aby zawierały tylko name, color i description
      return labels.map(label => ({
        name: label.name,
        color: label.color,
        description: label.description || '',
      }));
    } catch (error) {
      logger.debug(
        `Error fetching labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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

  async selectRepository(): Promise<string> {
    logger.debug('Fetching repositories for authenticated user');
    const spinner = ora(`Fetching repositories ...`).start();
    const { data: repos } = await this.octokit.repos.listForAuthenticatedUser();

    logger.debug(`Found ${repos.length} repositories`);
    spinner.succeed();
    logger.success('Done!');

    if (repos.length === 0) {
      logger.debug('No repositories found for the authenticated user');
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

    logger.debug(`Selected repository: ${selectedRepo}`);
    return selectedRepo;
  }

  async selectLabelsToDelete(repoFullName: string): Promise<string[]> {
    logger.debug(`Selecting labels to delete from repository: ${repoFullName}`);
    const labels = await this.getLabelsFromRepo(repoFullName);

    if (labels.length === 0) {
      logger.debug('No labels found in repository');
      throw new PublicError('No labels found in repository.');
    }

    const { selectedLabels } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedLabels',
        message: 'Select labels to delete:',
        choices: labels.map(label => ({
          name: `${label.name} (${label.description || 'No description'})`,
          value: label.name,
        })),
      },
    ]);

    if (!selectedLabels.length) {
      logger.debug('No labels were selected for deletion');
      throw new PublicError('No labels were selected for deletion.');
    }

    logger.debug(`Selected ${selectedLabels.length} labels for deletion`);
    return selectedLabels;
  }

  async deleteLabels(repoFullName: string): Promise<void> {
    try {
      logger.info(`Deleting labels from repository: ${repoFullName}\n`);
      logger.debug(`Starting label deletion process for ${repoFullName}`);

      const selectedLabels = await this.selectLabelsToDelete(repoFullName);
      const [owner, repo] = repoFullName.split('/');

      const spinner = ora('Deleting labels...').start();

      for (const labelName of selectedLabels) {
        try {
          logger.debug(`Attempting to delete label: ${labelName}`);
          await this.octokit.issues.deleteLabel({
            owner,
            repo,
            name: labelName,
          });
          logger.success(`Label "${labelName}" deleted successfully!`);
        } catch (error: any) {
          if (error instanceof RequestError) {
            if (error.status === 404) {
              logger.debug(`Label "${labelName}" not found in repository`);
              logger.warning(`Label "${labelName}" not found. Skipping...`);
              continue;
            }

            logger.debug(`GitHub API error (${error.status}): ${error.message}`);
            logger.error(`GitHub API error (${error.status}): ${error.message}`);
          } else {
            logger.debug(
              `Unexpected error while deleting label "${labelName}": ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            logger.error(
              `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }

      spinner.succeed('Labels deletion completed!');
    } catch (error: unknown) {
      logger.debug(
        `Failed to delete labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw new PublicError(
        `Failed to delete labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async addLabels(repoFullName: string): Promise<void> {
    try {
      logger.info(`Adding labels to repository: ${repoFullName}\n`);
      logger.debug(`Starting label addition process for ${repoFullName}`);

      const selectedLabels = await this.selectLabels();
      logger.debug(`Selected ${selectedLabels.length} labels to add`);
      const [owner, repo] = repoFullName.split('/');

      for (const label of selectedLabels) {
        try {
          logger.debug(`Attempting to create label: ${label.name}`);
          await this.octokit.issues.createLabel({
            owner,
            repo,
            name: label.name,
            color: label.color,
            description: label.description,
          });

          logger.success(`Label "${label.name}" added successfully!`);
        } catch (error: any) {
          if (error instanceof RequestError) {
            if (error.status === 422) {
              logger.debug(`Label "${label.name}" already exists in repository`);
              logger.warning(`Label "${label.name}" already exists. Skipping...`);
              continue;
            }

            logger.debug(`GitHub API error (${error.status}): ${error.message}`);
            logger.error(`GitHub API error (${error.status}): ${error.message}`);
          } else {
            logger.debug(
              `Unexpected error while adding label "${label.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            logger.error(
              `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }
    } catch (error: unknown) {
      logger.debug(
        `Failed to add labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw new PublicError(
        `Failed to add labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export { GitHubManager };
