import { Command } from "commander";
import { selectRepository } from "./repoSelector";
import { getGitHubClient } from "./github";

const program = new Command();

program
  .name("gh-labels")
  .description("CLI tool to add labels to a GitHub repository")
  .version("1.0.0")
  .option("-t, --token <token>", "GitHub Personal Access Token")
  .action(async (options) => {
    const octokit = getGitHubClient(options.token);
    const selectedRepo = await selectRepository(octokit);
    console.log(`✅ Selected Repository: ${selectedRepo}`);
  });

program.parse(process.argv);