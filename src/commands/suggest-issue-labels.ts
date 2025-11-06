import inquirer from 'inquirer';
import ora from 'ora';
import { GitHubManager } from '@/lib/github';
import { logger } from '@/utils/logger';
import { PublicError, OpenAIError, RateLimitError } from '@/utils/errors';
import { openAIService } from '@/lib/openai';

/**
 * Gets the issue template content from the repository
 */
async function getIssueTemplate(
  github: GitHubManager,
  repoFullName: string
): Promise<string | undefined> {
  try {
    const [owner, repo] = repoFullName.split('/');
    const templatePaths = [
      '.github/ISSUE_TEMPLATE.md',
      '.github/issue_template.md',
      'ISSUE_TEMPLATE.md',
      'issue_template.md',
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
    logger.warning('Could not fetch issue template, proceeding without it.');
    return undefined;
  }
}

/**
 * Options for selective AI suggestions
 */
export interface SuggestIssueLabelsOptions {
  labelsOnly?: boolean;
  descriptionOnly?: boolean;
  noLabels?: boolean;
  noDescription?: boolean;
}

/**
 * Suggest labels for an issue using AI
 * @param token Optional GitHub token
 * @param options Selective application options
 */
export async function suggestIssueLabelsAction(
  token?: string,
  options: SuggestIssueLabelsOptions = {}
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

    // Get issues
    const issues = await github.getIssues(repoFullName);
    if (issues.length === 0) {
      throw new PublicError('No open issues found in this repository.');
    }

    // Select an issue
    const { selectedIssue } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedIssue',
        message: 'Select an issue to analyze:',
        choices: issues.map(issue => ({
          name: `#${issue.number}: ${issue.title}`,
          value: issue,
        })),
      },
    ]);

    // Get repository labels
    spinner.text = 'Fetching repository labels...';
    spinner.start();
    const labels = await github.getLabelsFromRepo(repoFullName);
    spinner.succeed();

    // Get issue details
    spinner.text = 'Fetching issue details...';
    spinner.start();
    const issueDetails = await github.getIssueDetails(repoFullName, selectedIssue.number);
    spinner.succeed();

    // Get issue template if available
    spinner.text = 'Checking for issue template...';
    spinner.start();
    const issueTemplate = await getIssueTemplate(github, repoFullName);
    if (issueTemplate) {
      spinner.succeed('Found issue template');
    } else {
      spinner.info('No issue template found, proceeding without it');
    }

    // Analyze issue and suggest labels and description
    spinner.text = 'Analyzing issue with AI...';
    spinner.start();
    const suggestions = await openAIService.suggestIssueContent(
      issueDetails,
      labels,
      issueTemplate
    );
    spinner.succeed();

    // Display suggestions
    logger.info('\nHere are the suggestions for this issue:');

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
        message: 'Would you like to apply these changes to the issue?',
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

      spinner.text = 'Applying changes to issue...';
      spinner.start();

      // Prepare update payload
      const updatePayload: { body?: string; labels?: string[] } = {};

      if (applyDescription) {
        updatePayload.body = suggestions.description[language].content;
      }

      if (applyLabels) {
        updatePayload.labels = suggestions.labels.map(s => s.name);
      }

      // Update issue with selected features
      await github.updateIssue(repoFullName, selectedIssue.number, updatePayload);

      spinner.succeed();

      const appliedFeatures = [];
      if (applyLabels) appliedFeatures.push('labels');
      if (applyDescription) appliedFeatures.push('description');

      logger.success(`Successfully applied ${appliedFeatures.join(' and ')} to the issue!`);
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
