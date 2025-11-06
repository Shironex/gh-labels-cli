# Basic Commands

GitHub Labels CLI offers a set of simple commands to help you manage labels in your GitHub repositories.

## Command Overview

| Command                         | Description                               |
| ------------------------------- | ----------------------------------------- |
| `pnpm dev`                      | Run in interactive mode (default)         |
| `pnpm dev add-labels`           | Add predefined labels to a repository     |
| `pnpm dev get-labels`           | Get all labels from a repository in JSON  |
| `pnpm dev remove-labels`        | Remove labels from a repository           |
| `pnpm dev suggest-labels`       | Analyze a pull request and suggest labels |
| `pnpm dev suggest-issue-labels` | Analyze an issue and suggest labels       |
| `pnpm dev help`                 | Display help information                  |

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

### For Pull Requests

To analyze a pull request and get AI-powered label suggestions:

```bash
pnpm dev suggest-labels
```

This command will:

1. Prompt for your GitHub token (if not already provided)
2. Require your OpenAI API key from the `OPENAI_API_KEY` environment variable
3. Display a list of your repositories for selection
4. Fetch open pull requests from the selected repository
5. Let you choose a pull request to analyze
6. Analyze the pull request content, including title, description, and changed files
7. Generate label suggestions with confidence scores and explanations
8. Generate comprehensive descriptions in English and Polish
9. Let you choose whether to apply the suggested labels and/or description

**Command Options:**

```bash
# Apply only labels
pnpm dev suggest-labels --labels-only

# Apply only description
pnpm dev suggest-labels --description-only

# Skip labels
pnpm dev suggest-labels --no-labels

# Skip description
pnpm dev suggest-labels --no-description
```

### For Issues

To analyze an issue and get AI-powered label suggestions:

```bash
pnpm dev suggest-issue-labels
```

This command will:

1. Prompt for your GitHub token (if not already provided)
2. Require your OpenAI API key from the `OPENAI_API_KEY` environment variable
3. Display a list of your repositories for selection
4. Fetch open issues from the selected repository
5. Let you choose an issue to analyze
6. Analyze the issue content, including title, description, and metadata
7. Classify the issue type (bug, feature request, question, etc.)
8. Generate label suggestions with confidence scores and explanations
9. Generate comprehensive descriptions in English and Polish
10. Let you choose whether to apply the suggested labels and/or description

**Command Options:**

```bash
# Apply only labels
pnpm dev suggest-issue-labels --labels-only

# Apply only description
pnpm dev suggest-issue-labels --description-only

# Skip labels
pnpm dev suggest-issue-labels --no-labels

# Skip description
pnpm dev suggest-issue-labels --no-description
```

### Benefits

These AI-powered features use OpenAI's API to intelligently analyze pull requests and issues, making it easier to:

- Keep repositories organized without manually reviewing each item
- Maintain consistent labeling across your project
- Generate comprehensive, well-formatted descriptions
- Save time on documentation and categorization
- Ensure important changes and issues are properly documented

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
