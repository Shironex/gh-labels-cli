import ora from 'ora';
import { GitHubManager } from '@/lib/github';
import { logger } from '@/utils/logger';
import { PublicError } from '@/utils/errors';

/**
 * Remove labels from a repository
 * @param token GitHub token
 */
export async function removeLabelAction(token?: string): Promise<void> {
  try {
    const manager = new GitHubManager(token);

    const selectedRepo = await manager.selectRepository();
    logger.info(`Selected Repository: ${selectedRepo}`);

    await manager.removeLabels(selectedRepo);
  } catch (error: unknown) {
    throw new PublicError(
      `Error removing labels: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
