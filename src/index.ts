#!/usr/bin/env node

import { Command } from 'commander';
import { addLabelsAction, getLabelsAction, helpAction, interactiveMode } from '@/commands';

const program = new Command();

program
  .name('gh-labels')
  .description('CLI tool to manage labels in a GitHub repository')
  .version('1.0.0')
  .option('-t, --token <token>', 'GitHub Personal Access Token');

program.command('add').description('Add labels to a GitHub repository').action(addLabelsAction);

program
  .command('get-labels')
  .description('Get all labels from a GitHub repository in JSON format')
  .action(getLabelsAction);

program.command('help').description('Display all available commands').action(helpAction);

// If no arguments provided, run interactive mode
if (!process.argv.slice(2).length) {
  interactiveMode().catch(error => {
    console.error(error);
    process.exit(1);
  });
} else {
  program.parse(process.argv);
}
