import inquirer from 'inquirer';
import {
  addLabelsAction,
  getLabelsAction,
  helpAction,
  removeLabelAction,
  suggestLabelsAction,
  suggestIssueLabelsAction,
} from '@/commands';
import { SuggestLabelsOptions } from './suggest-labels';
import { SuggestIssueLabelsOptions } from './suggest-issue-labels';
import { config } from 'dotenv';

config();

/**
 * Get GitHub token from environment or prompt user
 * @returns GitHub token
 */
async function getGitHubToken(): Promise<string> {
  let gh_token = process.env.GITHUB_TOKEN;

  if (!gh_token) {
    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Please enter your GitHub Personal Access Token:',
        validate: input => {
          if (!input) return 'Token is required';
          return true;
        },
      },
    ]);

    gh_token = token as string;
  }

  return gh_token;
}

/**
 * Interactive command selection mode
 * Displays a menu with available commands and executes the selected one
 */
export async function interactiveMode(): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Add labels to a repository', value: 'add-labels' },
        { name: 'Get labels from a repository', value: 'get-labels' },
        { name: 'Remove labels from a repository', value: 'remove-labels' },
        { name: 'Suggest labels for a pull request', value: 'suggest-labels' },
        { name: 'Suggest labels for an issue', value: 'suggest-issue-labels' },
        { name: 'Display available commands', value: 'help' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);

  switch (action) {
    case 'add-labels':
      const addToken = await getGitHubToken();
      await addLabelsAction(addToken);
      break;
    case 'get-labels':
      const getLabelsToken = await getGitHubToken();
      await getLabelsAction(getLabelsToken);
      break;
    case 'remove-labels':
      const removeLabelsToken = await getGitHubToken();
      await removeLabelAction(removeLabelsToken);
      break;
    case 'suggest-labels':
      const suggestLabelsToken = await getGitHubToken();

      // Ask user about selective options
      const { applyOptions } = await inquirer.prompt([
        {
          type: 'list',
          name: 'applyOptions',
          message: 'What would you like to apply with AI suggestions?',
          choices: [
            { name: 'Both labels and description (default)', value: 'both' },
            { name: 'Only labels', value: 'labels-only' },
            { name: 'Only description', value: 'description-only' },
          ],
        },
      ]);

      let options: SuggestLabelsOptions = {};
      switch (applyOptions) {
        case 'labels-only':
          options = { labelsOnly: true };
          break;
        case 'description-only':
          options = { descriptionOnly: true };
          break;
        default:
          options = {};
          break;
      }

      await suggestLabelsAction(suggestLabelsToken, options);
      break;
    case 'suggest-issue-labels':
      const suggestIssueLabelsToken = await getGitHubToken();

      // Ask user about selective options
      const { applyIssueOptions } = await inquirer.prompt([
        {
          type: 'list',
          name: 'applyIssueOptions',
          message: 'What would you like to apply with AI suggestions?',
          choices: [
            { name: 'Both labels and description (default)', value: 'both' },
            { name: 'Only labels', value: 'labels-only' },
            { name: 'Only description', value: 'description-only' },
          ],
        },
      ]);

      let issueOptions: SuggestIssueLabelsOptions = {};
      switch (applyIssueOptions) {
        case 'labels-only':
          issueOptions = { labelsOnly: true };
          break;
        case 'description-only':
          issueOptions = { descriptionOnly: true };
          break;
        default:
          issueOptions = {};
          break;
      }

      await suggestIssueLabelsAction(suggestIssueLabelsToken, issueOptions);
      break;
    case 'help':
      helpAction();
      break;
    case 'exit':
      process.exit(0);
  }
}
