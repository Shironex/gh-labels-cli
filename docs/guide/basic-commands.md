# Basic Commands

GitHub Labels CLI offers a set of simple commands to help you manage labels in your GitHub repositories.

## Command Overview

| Command                   | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `pnpm dev`                | Run in interactive mode (default)                  |
| `pnpm dev add-labels`     | Add predefined labels to a repository              |
| `pnpm dev get-labels`     | Get all labels from a repository in JSON format    |
| `pnpm dev remove-labels`  | Remove labels from a repository                    |
| `pnpm dev suggest-labels` | Analyze a pull request and suggest labels using AI |
| `pnpm dev help`           | Display help information                           |

## Interactive Mode

Running the CLI without any specific command will start the interactive mode:

```bash
pnpm dev
```

In interactive mode, you'll be guided through a series of prompts to:

1. Enter your GitHub token (if not already provided)
2. Select a command to execute
3. Select a repository to work with
4. Choose specific labels or options depending on the command

## Adding Labels

To add predefined labels to a repository:

```bash
pnpm dev add-labels
```

This command will:

1. Prompt for your GitHub token (if not already provided)
2. Display a list of your repositories for selection
3. If multiple label templates are available in the `src/labels` directory, prompt you to select a template
4. Show the available labels from the selected template for you to choose from
5. Add the selected labels to the chosen repository

The default label template is located at `src/labels/default.json`, but you can use labels from repositories you've previously exported with the `get-labels` command.

## Getting Labels

To retrieve all labels from a repository in JSON format:

```bash
pnpm dev get-labels
```

This command will:

1. Prompt for your GitHub token (if not already provided)
2. Display a list of your repositories for selection
3. Fetch all labels from the selected repository
4. Save the labels to a JSON file in the `src/labels` directory, named after the repository (e.g., `src/labels/owner-repo.json`)

The output file will contain all labels with their names, colors, and descriptions in JSON format. These saved labels can then be used as templates when adding labels to other repositories.

## Removing Labels

To remove labels from a repository:

```bash
pnpm dev remove-labels
```

This command will:

1. Prompt for your GitHub token (if not already provided)
2. Display a list of your repositories for selection
3. Fetch all labels from the selected repository
4. Display a checklist of labels for you to select which ones to remove
5. Remove the selected labels from the repository

This is useful for cleaning up repositories by removing outdated, duplicate, or unwanted labels.

## Suggesting Labels with AI

To analyze a pull request and get AI-powered label suggestions:

```bash
pnpm dev suggest-labels
```

This command will:

1. Prompt for your GitHub token (if not already provided)
2. Ask for your OpenAI API key if the `OPENAI_API_KEY` environment variable is not set
3. Display a list of your repositories for selection
4. Fetch open pull requests from the selected repository
5. Let you choose a pull request to analyze
6. Analyze the pull request content, including title, description, and changed files
7. Generate label suggestions based on the analysis, with confidence scores and explanations
8. Let you choose whether to apply the suggested labels to the pull request

This feature uses OpenAI's API to intelligently analyze pull requests and suggest the most appropriate labels, making it easier to keep your repositories organized without manually reviewing each PR for labeling.

## Creating Custom Label Templates

You can create your own label templates to use with the CLI:

1. Create a JSON file in the `src/labels/` directory with a descriptive name (e.g., `my-project.json`)
2. Structure your file as an array of label objects with the following format:

```json
[
  {
    "name": "bug",
    "color": "d73a4a",
    "description": "Something isn't working"
  },
  {
    "name": "feature",
    "color": "0366d6",
    "description": "New feature or request"
  }
]
```

Your custom template will automatically appear in the template selection list when you run the `add-labels` command.

## Help

To display available commands and options:

```bash
pnpm dev help
```

This shows a list of all available commands and their descriptions.
