import inquirer from 'inquirer';
import { addLabelsAction, getLabelsAction, deleteLabelsAction, helpAction } from './index';
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
        { name: 'Get labels from a repository in JSON format', value: 'get-labels' },
        { name: 'Delete labels from a repository', value: 'delete-labels' },
        { name: 'Display help information', value: 'help' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);

  if (action === 'exit') {
    process.exit(0);
  }

  if (action === 'help') {
    helpAction();
    return;
  }

  const token = await getGitHubToken();

  switch (action) {
    case 'add-labels':
      await addLabelsAction(token);
      break;
    case 'get-labels':
      await getLabelsAction(token);
      break;
    case 'delete-labels':
      await deleteLabelsAction(token);
      break;
    default:
      process.exit(1);
  }
}
