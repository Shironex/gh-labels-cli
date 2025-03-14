#!/usr/bin/env node

import { Command } from "commander";
import { logger } from "@/utils/logger";
import { GitHubManager } from "@/lib/github";
import { PublicError } from "@/utils/errors";

const program = new Command();

program
  .name("gh-labels")
  .description("CLI tool to add labels to a GitHub repository")
  .version("1.0.0")
  .option("-t, --token <token>", "GitHub Personal Access Token")
  .action(async (options) => {
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
        `Error fetching repositories: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });

program.parse(process.argv);
