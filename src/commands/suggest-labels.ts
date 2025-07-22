import inquirer from 'inquirer';
import ora from 'ora';
import { GitHubManager } from '@/lib/github';
import { logger } from '@/utils/logger';
import { PublicError, OpenAIError, RateLimitError } from '@/utils/errors';
import { openAIService } from '@/lib/openai';

/**
 * Gets the PR template content from the repository
 */
async function getPRTemplate(
  github: GitHubManager,
  repoFullName: string
): Promise<string | undefined> {
  try {
    const [owner, repo] = repoFullName.split('/');
    const templatePaths = [
      '.github/PULL_REQUEST_TEMPLATE.md',
      '.github/pull_request_template.md',
      'PULL_REQUEST_TEMPLATE.md',
      'pull_request_template.md',
    ];

    for (const templatePath of templatePaths) {
      try {
        const { data } = await github.octokit.repos.getContent({
          owner,
          repo,
          path: templatePath,
        });

        if ('content' in data) {
          const content = Buffer.from(data.content, 'base64').toString('utf-8');
          return content;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        continue; // Try next template path
      }
    }

    return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    logger.warning('Could not fetch PR template, proceeding without it.');
    return undefined;
  }
}

/**
 * Options for selective AI suggestions
 */
export interface SuggestLabelsOptions {
  labelsOnly?: boolean;
  descriptionOnly?: boolean;
  noLabels?: boolean;
  noDescription?: boolean;
}

/**
 * Suggest labels for a pull request using AI
 * @param token Optional GitHub token
 * @param options Selective application options
 */
export async function suggestLabelsAction(
  token?: string,
  options: SuggestLabelsOptions = {}
): Promise<void> {
  try {
    // Determine what features to apply based on options
    const applyLabels = !options.noLabels && (options.labelsOnly || !options.descriptionOnly);
    const applyDescription =
      !options.noDescription && (options.descriptionOnly || !options.labelsOnly);

    // Validate options
    if (!applyLabels && !applyDescription) {
      throw new PublicError('At least one feature must be enabled. Cannot disable all options.');
    }

    const spinner = ora('Starting AI suggestion analysis...').start();
    const github = new GitHubManager(token);
    spinner.succeed();

    // Select a repository
    const repoFullName = await github.selectRepository();
    logger.info(`Selected repository: ${repoFullName}`);

    // Get pull requests
    const pullRequests = await github.getPullRequests(repoFullName);
    if (pullRequests.length === 0) {
      throw new PublicError('No open pull requests found in this repository.');
    }

    // Select a pull request
    const { selectedPR } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedPR',
        message: 'Select a pull request to analyze:',
        choices: pullRequests.map(pr => ({
          name: `#${pr.number}: ${pr.title}`,
          value: pr,
        })),
      },
    ]);

    // Get repository labels
    spinner.text = 'Fetching repository labels...';
    spinner.start();
    const labels = await github.getLabelsFromRepo(repoFullName);
    spinner.succeed();

    // Get pull request details
    spinner.text = 'Fetching pull request details...';
    spinner.start();
    const prDetails = await github.getPullRequestDetails(repoFullName, selectedPR.number);
    spinner.succeed();

    // Get PR template if available
    spinner.text = 'Checking for PR template...';
    spinner.start();
    const prTemplate = await getPRTemplate(github, repoFullName);
    if (prTemplate) {
      spinner.succeed('Found PR template');
    } else {
      spinner.info('No PR template found, proceeding without it');
    }

    // Analyze PR and suggest labels and description
    spinner.text = 'Analyzing pull request with AI...';
    spinner.start();
    const suggestions = await openAIService.suggestPRContent(prDetails, labels, prTemplate);
    spinner.succeed();

    // Display suggestions
    logger.info('\nHere are the suggestions for this pull request:');

    if (applyLabels) {
      logger.info('\nSuggested Labels:');
      suggestions.labels.forEach(suggestion => {
        const status = suggestion.isNew ? '[NEW]' : '[EXISTING]';
        const confidence = `(Confidence: ${suggestion.confidence}%)`;
        logger.info(`${status} ${suggestion.name} ${confidence}`);
        logger.info(`   Reason: ${suggestion.description}`);
        logger.info('');
      });
    }

    if (applyDescription) {
      logger.info('\nSuggested Description:');
      logger.info('\nEnglish version:');
      logger.info(`Confidence: ${suggestions.description.en.confidence}%`);
      logger.info(suggestions.description.en.content);
      logger.info('\nPolish version:');
      logger.info(`Confidence: ${suggestions.description.pl.confidence}%`);
      logger.info(suggestions.description.pl.content);
      logger.info('');
    }

    // Ask if user wants to apply changes
    const { shouldApply } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldApply',
        message: 'Would you like to apply these changes to the pull request?',
        default: true,
      },
    ]);

    if (shouldApply) {
      // Only ask for language if description will be applied
      let language: 'en' | 'pl' = 'en';
      if (applyDescription) {
        const languagePrompt = await inquirer.prompt<{ language: 'en' | 'pl' }>([
          {
            type: 'list',
            name: 'language',
            message: 'Which language version would you like to use for the description?',
            choices: [
              { name: 'English', value: 'en' },
              { name: 'Polish', value: 'pl' },
            ],
          },
        ]);
        language = languagePrompt.language;
      }

      spinner.text = 'Applying changes to pull request...';
      spinner.start();

      // Prepare update payload
      const updatePayload: { body?: string; labels?: string[] } = {};

      if (applyDescription) {
        updatePayload.body = suggestions.description[language].content;
      }

      if (applyLabels) {
        updatePayload.labels = suggestions.labels.map(s => s.name);
      }

      // Update PR with selected features
      await github.updatePullRequest(repoFullName, selectedPR.number, updatePayload);

      spinner.succeed();

      const appliedFeatures = [];
      if (applyLabels) appliedFeatures.push('labels');
      if (applyDescription) appliedFeatures.push('description');

      logger.success(`Successfully applied ${appliedFeatures.join(' and ')} to the pull request!`);
    } else {
      logger.info('No changes were applied.');
    }
  } catch (error) {
    if (error instanceof PublicError) {
      logger.error(error.message);
      throw error;
    } else if (error instanceof OpenAIError) {
      logger.error(`Błąd usługi AI: ${error.message}`);
      throw error;
    } else if (error instanceof RateLimitError) {
      logger.error('Limit żądań został przekroczony. Spróbuj ponownie później.');
      throw error;
    } else if (error instanceof Error && error.message.includes('network')) {
      const errorMessage = 'Błąd sieci. Sprawdź połączenie internetowe i spróbuj ponownie.';
      logger.error(errorMessage);
      throw new PublicError(errorMessage);
    } else {
      const errorMessage = `Nieoczekiwany błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`;
      logger.error(errorMessage);
      throw new PublicError(errorMessage);
    }
  }
}
