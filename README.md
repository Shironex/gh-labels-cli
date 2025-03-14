# GitHub Labels CLI

Command-line tool for managing labels in GitHub repositories.

## Features

- Fetch user's repositories list
- Select a repository to manage labels
- Choose labels to add from a predefined list
- Add selected labels to the repository

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
# Run the tool
pnpm start

# Or after global installation
gh-labels-cli
```

### GitHub Token

The tool requires a GitHub token with repository management permissions. You can set the token in two ways:

1. As an environment variable `GITHUB_TOKEN`, in a `.env` file in the project root directory:

```
GITHUB_TOKEN=your_github_token
```

2. Use a --token flag when running script

```bash
# Run the tool builded tool
pnpm start --token=your_github_token
```

```bash
# Run the tool in development mode
pnpm dev --token=your_github_token
```

## Development

### Requirements

- Node.js 20 or newer
- pnpm 9.12.3 or newer

### Scripts

- `pnpm build` - Builds the project
- `pnpm start` - Runs the built project
- `pnpm dev` - Runs the project in development mode
- `pnpm lint` - Checks the code for errors
- `pnpm test` - Runs tests
- `pnpm test:coverage` - Runs tests with code coverage

### Tests

The project includes unit and integration tests that can be run using the `pnpm test` command. Tests are written using the Vitest framework.

Test structure:

- `tests/unit/` - Unit tests for individual components
- `tests/integration/` - Integration tests for the entire CLI

Code coverage can be checked using the `pnpm test:coverage` command.

## License

MIT
