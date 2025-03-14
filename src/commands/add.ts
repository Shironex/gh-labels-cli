import { GitHubManager } from '@/lib/github';
import { logger } from '@/utils/logger';
import { PublicError } from '@/utils/errors';

export async function addLabelsAction() {
  try {
    const manager = new GitHubManager();

    const selectedRepo = await manager.selectRepository();
    logger.info(`Selected Repository: ${selectedRepo}`);

    await manager.addLabels(selectedRepo);
  } catch (error) {
    if (error instanceof PublicError) {
      throw error;
    }
    throw new PublicError(
      `Error adding labels: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
