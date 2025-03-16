import { GitHubManager } from '../lib/github';
import { PublicError } from '../utils/errors';
import { ConfigManager } from '../config/ConfigManager';

/**
 * Adds labels to a GitHub repository
 * Ensures configuration exists and is valid before proceeding
 * @param token GitHub token for authentication
 * @returns Promise that resolves when labels are added successfully
 * @throws PublicError if configuration is invalid or label addition fails
 */
export async function addLabelsAction(token?: string): Promise<void> {
  try {
    // Ensure configuration exists and is valid
    ConfigManager.ensureConfig();

    const manager = new GitHubManager(token);
    const selectedRepo = await manager.selectRepository();
    await manager.addLabels(selectedRepo);
  } catch (error) {
    if (error instanceof Error) {
      throw new PublicError(error.message);
    }
    throw error;
  }
}
