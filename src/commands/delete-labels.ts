import { GitHubManager } from '../lib/github';
import { PublicError } from '../utils/errors';
import { ConfigManager } from '../config/ConfigManager';

/**
 * Deletes labels from a GitHub repository
 * Ensures configuration exists and is valid before proceeding
 * Prompts user to select which labels to delete
 * @param token GitHub token for authentication
 * @returns Promise that resolves when labels are deleted successfully
 * @throws PublicError if configuration is invalid or label deletion fails
 */
export async function deleteLabelsAction(token?: string): Promise<void> {
  try {
    // Ensure configuration exists and is valid
    ConfigManager.ensureConfig();

    const manager = new GitHubManager(token);
    const selectedRepo = await manager.selectRepository();
    await manager.deleteLabels(selectedRepo);
  } catch (error) {
    if (error instanceof Error) {
      throw new PublicError(error.message);
    }
    throw error;
  }
}
