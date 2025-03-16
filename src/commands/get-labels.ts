import { GitHubManager } from '../lib/github';
import { PublicError } from '../utils/errors';
import { ConfigManager } from '../config/ConfigManager';
import { logger } from '../utils/logger';

/**
 * Gets labels from a GitHub repository
 * Ensures configuration exists and is valid before proceeding
 * Outputs labels in JSON format to the console
 * @param token GitHub token for authentication
 * @returns Promise that resolves when labels are retrieved successfully
 * @throws PublicError if configuration is invalid or label retrieval fails
 */
export async function getLabelsAction(token?: string): Promise<void> {
  try {
    // Ensure configuration exists and is valid
    ConfigManager.ensureConfig();

    const manager = new GitHubManager(token);
    const selectedRepo = await manager.selectRepository();
    const labels = await manager.getLabelsFromRepo(selectedRepo);
    logger.info(JSON.stringify(labels, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      throw new PublicError(error.message);
    }
    throw error;
  }
}
