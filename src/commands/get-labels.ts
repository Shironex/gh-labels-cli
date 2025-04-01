import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { GitHubManager } from '@/lib/github';
import { logger } from '@/utils/logger';
import { PublicError } from '@/utils/errors';

export async function getLabelsAction(token?: string) {
  try {
    const manager = new GitHubManager(token);

    const selectedRepo = await manager.selectRepository();
    logger.info(`Selected Repository: ${selectedRepo}`);

    const labels = await manager.getLabelsFromRepo(selectedRepo);

    // Use process.cwd() to get the current working directory
    // and navigate to src/labels from the project root
    const labelsDir = path.join(process.cwd(), 'src', 'labels');
    if (!fs.existsSync(labelsDir)) {
      fs.mkdirSync(labelsDir, { recursive: true });
    }

    // Create safe filename from repository name
    const safeRepoName = selectedRepo.replace(/\//g, '-');
    const outputPath = path.join(labelsDir, `${safeRepoName}.json`);

    // Save labels to file
    const spinner = ora('Saving labels to file...').start();
    fs.writeFileSync(outputPath, JSON.stringify(labels, null, 2));
    spinner.succeed();

    logger.success(`Labels saved to ${outputPath}`);
    logger.info('You can now use these labels when adding labels to other repositories.');
  } catch (error) {
    if (error instanceof PublicError) {
      throw error;
    }
    throw new PublicError(
      `Error fetching labels: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
