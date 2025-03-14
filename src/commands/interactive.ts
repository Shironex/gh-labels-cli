import inquirer from 'inquirer';
import { addLabelsAction, getLabelsAction, helpAction } from './index';

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
        { name: 'Add labels to a repository', value: 'add' },
        { name: 'Get labels from a repository in JSON format', value: 'get-labels' },
        { name: 'Display available commands', value: 'help' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);

  if (command === 'exit') {
    process.exit(0);
  } else if (command === 'add') {
    await addLabelsAction();
  } else if (command === 'get-labels') {
    await getLabelsAction();
  } else if (command === 'help') {
    helpAction();
  }
}
