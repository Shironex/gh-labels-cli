# GitHub Labels CLI

Command-line tool for managing labels in GitHub repositories.

## Features

- Fetch user's repositories list
- Select a repository to manage labels
- Choose labels to add from predefined templates
- Remove selected labels from repositories
- Add selected labels to the repository
- Get all labels from a repository and save them as templates
- Use previously saved labels as templates for new repositories
- Interactive mode for guided label management

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gh-labels-cli.git
cd gh-labels-cli

# Install dependencies
pnpm install

# Build the project
pnpm build
```

## Usage

```bash
# Run the tool in interactive mode
pnpm start

# Or during development
pnpm dev
```

### Available Commands

```bash
# Interactive mode (default when no command is specified)
pnpm dev

# Add labels to a repository
pnpm dev add-labels

# Get all labels from a repository in JSON format
pnpm dev get-labels

# Remove labels from a repository
pnpm dev remove-labels

# Suggest labels for a pull request
pnpm dev suggest-labels

# Display help information
pnpm dev help
```

## AI-Powered Label Suggestions

The `suggest-labels` feature uses artificial intelligence to analyze pull requests and automatically suggest appropriate labels. This feature analyzes:

- Pull request title and description
- Files that have been changed
- Existing labels in the repository

To use this feature:

1. Set your OpenAI API key in the `OPENAI_API_KEY` environment variable.
2. Run the command `pnpm dev suggest-labels` or select "Suggest labels for a pull request" in interactive mode.
3. Select a repository and then choose a pull request to analyze.
4. The AI will analyze the changes and suggest appropriate labels with explanations.
5. You can review and apply the suggested labels to the selected pull request.

This feature is especially useful for large teams where automating the categorization of pull requests can significantly improve workflow efficiency.
