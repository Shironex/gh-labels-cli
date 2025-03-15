import { GitHubManager } from '@/lib/github';
import { logger } from '@/utils/logger';
import { PublicError } from '@/utils/errors';

export async function deleteLabelsAction(token?: string) {
  try {
    const manager = new GitHubManager(token);

    const selectedRepo = await manager.selectRepository();
    logger.info(`Selected Repository: ${selectedRepo}`);

    await manager.deleteLabels(selectedRepo);
  } catch (error) {
    if (error instanceof PublicError) {
      throw error;
    }
    throw new PublicError(
      `Error deleting labels: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
