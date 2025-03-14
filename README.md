# GitHub Labels CLI

Command-line tool for managing labels in GitHub repositories.

## Features

- Fetch user's repositories list
- Select a repository to manage labels
- Choose labels to add from a predefined list
- Add selected labels to the repository
- Get all labels from a repository in JSON format
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

# Or after global installation
gh-labels
```

### Available Commands

```bash
# Interactive mode (default when no command is specified)
gh-labels

# Add labels to a repository
gh-labels add-labels -t "your_github_token"

# Get all labels from a repository in JSON format
gh-labels get-labels -t "your_github_token"

# Display help information
gh-labels help
```

### GitHub Token

The tool requires a GitHub token with repository management permissions. You can set the token in three ways:

1. As an environment variable `GITHUB_TOKEN` (only works when the project is cloned and run locally):
   - Create a `.env` file in the project root directory:

```
GITHUB_TOKEN=your_github_token
```

2. Use a `-t` or `--token` flag when running script (works with both local and global installation):

```bash
# Add labels to a repository
gh-labels add-labels -t "your_github_token"

# Get labels from a repository
gh-labels get-labels -t "your_github_token"
```

3. When running in interactive mode, if no token is provided via environment variable or command line flag, you will be prompted to enter your GitHub token securely. Tokens are not stored anywhere so you will be prompted to enter it every time:

```bash
# Run in interactive mode and you'll be prompted for token when needed
gh-labels
# Select 'Add labels to a repository' or 'Get labels from a repository in JSON format'
# You'll be prompted: 'Please enter your GitHub Personal Access Token:'
```

### Development Mode

When using the development mode with pnpm:

```bash
# For interactive mode
pnpm dev

# For specific commands with token
pnpm dev get-labels -t "your_github_token"
pnpm dev add-labels -t "your_github_token"
```

## Development

### Requirements

- Node.js 20 or newer
- pnpm 9.12.3 or newer

### Scripts

- `pnpm build` - Builds the project
- `pnpm start` - Runs the built project
- `pnpm dev` - Runs the project in development mode
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm lint` - Checks the code for errors
- `pnpm lint:fix` - Fix linting errors automatically
- `pnpm commit` - Use commitizen for conventional commits
- `pnpm release` - Run semantic-release
- `pnpm release:dry` - Run semantic-release in dry-run mode
- `pnpm test` - Runs tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Runs tests with code coverage

### Tests

The project includes unit and integration tests that can be run using the `pnpm test` command. Tests are written using the Vitest framework.

Test structure:

- `tests/unit/` - Unit tests for individual components
- `tests/integration/` - Integration tests for the entire CLI

Code coverage can be checked using the `pnpm test:coverage` command.

### Project Structure

```
src/
├── commands/            # CLI commands implementation
│   ├── add-labels.ts    # Add labels command
│   ├── get-labels.ts    # Get labels command
│   ├── help.ts          # Help command
│   ├── index.ts         # Commands exports
│   └── interactive.ts   # Interactive mode implementation
├── json/                # JSON data files
│   └── labels.json      # Predefined labels data
├── lib/                 # Core functionality
│   └── github.ts        # GitHub API integration
├── types/               # TypeScript type definitions
│   └── index.ts         # Type definitions
├── utils/               # Utility functions
│   ├── errors.ts        # Error handling utilities
│   └── logger.ts        # Logging utilities
└── index.ts             # Main entry point
```

## License

MIT
