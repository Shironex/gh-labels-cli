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
 * Helper function to get apply options for AI suggestions
 */
async function getApplyOptions(_type: 'PR' | 'issue'): Promise<SuggestLabelsOptions> {
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

  switch (applyOptions) {
    case 'labels-only':
      return { labelsOnly: true };
    case 'description-only':
      return { descriptionOnly: true };
    default:
      return {};
  }
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

  // Handle exit and help commands that don't need a token
  if (action === 'exit') {
    process.exit(0);
  }

  if (action === 'help') {
    helpAction();
    return;
  }

  // Get token once for all operations that require it
  const token = await getGitHubToken();

  // Execute the selected action
  switch (action) {
    case 'add-labels':
      await addLabelsAction(token);
      break;
    case 'get-labels':
      await getLabelsAction(token);
      break;
    case 'remove-labels':
      await removeLabelAction(token);
      break;
    case 'suggest-labels': {
      const options = await getApplyOptions('PR');
      await suggestLabelsAction(token, options);
      break;
    }
    case 'suggest-issue-labels': {
      const options = await getApplyOptions('issue');
      await suggestIssueLabelsAction(token, options);
      break;
    }
  }
}
