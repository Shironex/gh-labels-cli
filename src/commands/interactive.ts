import inquirer from 'inquirer';
import { addLabelsAction, getLabelsAction, helpAction } from './index';
import { config } from 'dotenv';
import { logger } from '@/utils/logger';

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
  const { command } = await inquirer.prompt([
    {
      type: 'list',
      name: 'command',
      message: 'Select a command:',
      choices: [
        { name: 'Add labels to a repository', value: 'add-labels' },
        { name: 'Get labels from a repository in JSON format', value: 'get-labels' },
        { name: 'Display available commands', value: 'help' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);

  switch (command) {
    case 'exit':
      process.exit(0);

    case 'add-labels':
      const addToken = await getGitHubToken();
      await addLabelsAction(addToken);
      break;

    case 'get-labels':
      const getLabelsToken = await getGitHubToken();
      await getLabelsAction(getLabelsToken);
      break;

    case 'help':
      helpAction();
      break;

    default:
      logger.error('Invalid command');
      process.exit(1);
  }
}
