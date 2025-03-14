import { GitHubManager } from '@/lib/github';
import { logger } from '@/utils/logger';
import { PublicError } from '@/utils/errors';

export async function getLabelsAction() {
  try {
    const manager = new GitHubManager();

    const selectedRepo = await manager.selectRepository();
    logger.info(`Selected Repository: ${selectedRepo}`);

    const labels = await manager.getLabelsFromRepo(selectedRepo);
    console.log(JSON.stringify(labels, null, 2));
  } catch (error) {
    if (error instanceof PublicError) {
      throw error;
    }
    throw new PublicError(
      `Error fetching labels: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
