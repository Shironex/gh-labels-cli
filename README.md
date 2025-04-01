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

# Display help information
pnpm dev help
```

### GitHub Token

The tool requires a GitHub token with repository management permissions. You can set the token in two ways:

1. As an environment variable `GITHUB_TOKEN`:
   - Create a `.env` file in the project root directory:

```
GITHUB_TOKEN=your_github_token
```

2. When running in interactive mode, if no token is provided via environment variable, you will be prompted to enter your GitHub token securely:

```bash
# Run in interactive mode and you'll be prompted for token when needed
pnpm dev
# You'll be prompted: 'Please enter your GitHub Personal Access Token:'
```

### Label Templates

When adding labels to a repository, you can choose from available templates:

1. **Default template** - The default set of labels included with the tool
2. **Custom templates** - Labels you've previously exported from other repositories using the `get-labels` command

When running the `get-labels` command, the exported labels are saved to the `src/labels` directory with the repository name as the filename (e.g., `owner-repo.json`). These saved labels automatically become available as templates when adding labels to repositories.

### Contributing Your Own Labels

If you want to contribute your own label templates to use with the tool:

1. Create a JSON file with your labels in the `src/labels/` directory
2. Follow the format below:

```json
[
  {
    "name": "bug",
    "color": "d73a4a",
    "description": "Something isn't working"
  },
  {
    "name": "enhancement",
    "color": "a2eeef",
    "description": "New feature or request"
  }
]
```

Your custom labels will automatically appear as a template option when running the `add-labels` command.

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
├── labels/              # Label templates and exported labels
│   └── default.json     # Default label template
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
