#!/usr/bin/env node

import { Command } from 'commander';
import { getPackageJsonVersion } from '@/utils/package-helper';
import {
  addLabelsAction,
  getLabelsAction,
  helpAction,
  interactiveMode,
  removeLabelAction,
  suggestLabelsAction,
} from '@/commands';
import { PublicError } from '@/utils/errors';
import { logger } from '@/utils/logger';

const program = new Command();

program
  .name('gh-labels')
  .description('CLI tool to manage labels in a GitHub repository')
  .version(getPackageJsonVersion())
  .option('-t, --token <token>', 'GitHub Personal Access Token');

program
  .command('add-labels')
  .description('Add labels to a GitHub repository')
  .action(() => {
    const options = program.opts();
    addLabelsAction(options.token);
  });

program
  .command('get-labels')
  .description('Get all labels from a GitHub repository in JSON format')
  .action(() => {
    const options = program.opts();
    getLabelsAction(options.token);
  });

program
  .command('remove-labels')
  .description('Remove labels from a GitHub repository')
  .action(() => {
    const options = program.opts();
    removeLabelAction(options.token);
  });

program
  .command('suggest-labels')
  .description('Analyze a pull request and suggest labels using AI')
  .action(() => {
    const options = program.opts();
    suggestLabelsAction(options.token);
  });

program.command('help').description('Display all available commands').action(helpAction);

// If no arguments provided, run interactive mode
if (!process.argv.slice(2).length) {
  interactiveMode().catch(error => {
    if (error instanceof PublicError) {
      logger.error(error.message);
    } else {
      logger.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    process.exit(1);
  });
} else {
  program.parse(process.argv);
}
