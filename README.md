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
- AI-powered label and description suggestions for pull requests
- AI-powered label and description suggestions for issues
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

# Suggest labels for a pull request using AI
pnpm dev suggest-labels

# Suggest labels for an issue using AI
pnpm dev suggest-issue-labels

# Display help information
pnpm dev help
```

## AI-Powered Label and Description Suggestions

The AI-powered suggestion features use artificial intelligence to analyze pull requests and issues, automatically suggesting appropriate labels and descriptions.

### For Pull Requests (`suggest-labels`)

Analyzes:

- Pull request title and description
- Files that have been changed
- Existing labels in the repository
- Code changes and their context

Usage:

1. Set your OpenAI API key in the `OPENAI_API_KEY` environment variable
2. Run `pnpm dev suggest-labels` or select "Suggest labels for a pull request" in interactive mode
3. Select a repository and choose a pull request to analyze
4. Review and apply the AI-generated suggestions:
   - Appropriate labels with explanations and confidence scores
   - Comprehensive description following Conventional Commits specification

### For Issues (`suggest-issue-labels`)

Analyzes:

- Issue title and description
- Issue state and metadata
- Existing labels in the repository
- Issue type classification (bug, feature, question, etc.)

Usage:

1. Set your OpenAI API key in the `OPENAI_API_KEY` environment variable
2. Run `pnpm dev suggest-issue-labels` or select "Suggest labels for an issue" in interactive mode
3. Select a repository and choose an issue to analyze
4. Review and apply the AI-generated suggestions:
   - Relevant labels with explanations and confidence scores
   - Comprehensive issue description with context and recommendations

### Command Options

Both commands support selective application:

```bash
# Apply only labels
pnpm dev suggest-labels --labels-only
pnpm dev suggest-issue-labels --labels-only

# Apply only description
pnpm dev suggest-labels --description-only
pnpm dev suggest-issue-labels --description-only

# Skip labels
pnpm dev suggest-labels --no-labels
pnpm dev suggest-issue-labels --no-labels

# Skip description
pnpm dev suggest-labels --no-description
pnpm dev suggest-issue-labels --no-description
```

### Benefits

- **Automated Categorization**: Improve workflow efficiency in large teams
- **Consistent Documentation**: Maintain uniform descriptions across the project
- **Bilingual Support**: Generates descriptions in both English and Polish
- **Time Savings**: Reduce manual review and documentation effort
- **Quality Assurance**: Ensures important changes are properly documented
