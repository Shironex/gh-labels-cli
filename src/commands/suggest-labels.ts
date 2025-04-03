import inquirer from 'inquirer';
import ora from 'ora';
import { GitHubManager } from '@/lib/github';
import { logger } from '@/utils/logger';
import { PublicError, OpenAIError, RateLimitError } from '@/utils/errors';
import { openAIService } from '@/lib/openai';

/**
 * Suggest labels for a pull request using AI
 * @param token Optional GitHub token
 */
export async function suggestLabelsAction(token?: string): Promise<void> {
  try {
    const spinner = ora('Starting AI label suggestion...').start();
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

    // Analyze PR and suggest labels
    spinner.text = 'Analyzing pull request with AI...';
    spinner.start();
    const suggestions = await openAIService.suggestLabels(prDetails, labels);
    spinner.succeed();

    // Display suggestions
    logger.info('\nHere are the suggested labels for this pull request:');
    suggestions.forEach(suggestion => {
      const status = suggestion.isNew ? '[NEW]' : '[EXISTING]';
      const confidence = `(Confidence: ${suggestion.confidence}%)`;
      logger.info(`${status} ${suggestion.name} ${confidence}`);
      logger.info(`   Reason: ${suggestion.description}`);
      logger.info('');
    });

    // Ask if user wants to apply labels
    const { shouldApply } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldApply',
        message: 'Would you like to apply these labels to the pull request?',
        default: true,
      },
    ]);

    if (shouldApply) {
      spinner.text = 'Applying labels to pull request...';
      spinner.start();

      // Filter out new labels if needed
      const labelsToApply = suggestions.map(s => s.name);

      await github.addLabelsToPullRequest(repoFullName, selectedPR.number, labelsToApply);
      spinner.succeed();
      logger.success('Labels have been successfully applied to the pull request!');
    } else {
      logger.info('No labels were applied.');
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
