import { logger } from '../utils/logger';

/**
 * Displays help information about available commands
 * Lists all commands with their descriptions
 * @returns void
 */
export function helpAction(): void {
  logger.info('Available commands:');
  logger.info('  add-labels  - Add labels to a repository');
  logger.info('  get-labels  - Get labels from a repository in JSON format');
  logger.info('  delete-labels - Delete labels from a repository');
  logger.info('  help       - Display this help information');
}
