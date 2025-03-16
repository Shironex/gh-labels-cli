import inquirer from 'inquirer';
import { addLabelsAction, getLabelsAction, deleteLabelsAction, helpAction } from '.';
import { config } from 'dotenv';
import { handleConfigInteractive } from './config';
import { ConfigManager } from '../config/ConfigManager';
import { PublicError } from '../utils/errors';
import { logger } from '../utils/logger';

config();

/**
 * Gets GitHub token from environment or prompts user for input
 * @returns Promise that resolves with the GitHub token
 * @throws PublicError if token is not available or invalid
 */
async function getToken(): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const { token: inputToken } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Enter your GitHub token:',
        validate: (input: string) => {
          if (!input) {
            return 'Token is required';
          }
          return true;
        },
      },
    ]);
    return inputToken;
  }
  return token;
}

/**
 * Interactive command selection mode
 * Displays a menu with available commands and executes the selected one
 */
export async function interactiveMode(): Promise<void> {
  try {
    // Ensure configuration exists and is valid
    ConfigManager.ensureConfig();

    const token = await getToken();

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Add labels to a repository', value: 'add-labels' },
          { name: 'Get labels from a repository', value: 'get-labels' },
          { name: 'Delete labels from a repository', value: 'delete-labels' },
          { name: 'Manage Configuration', value: 'config' },
          { name: 'Show help', value: 'help' },
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

    if (action === 'config') {
      await handleConfigInteractive();
      // Return to main menu after config management
      await interactiveMode();
      return;
    }

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
        logger.error(`Unknown action: ${action}`);
        process.exit(1);
    }
  } catch (error) {
    if (error instanceof PublicError) {
      logger.error(error.message);
    } else {
      logger.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}
