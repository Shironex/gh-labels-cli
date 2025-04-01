# Installation

GitHub Labels CLI is designed to be run from source. Follow these steps to set up the project locally.

## Prerequisites

Before you begin, make sure you have:

- Node.js (version 20 or higher)
- pnpm (version 9.12.3 or higher)
- A GitHub account
- A GitHub Personal Access Token with appropriate permissions

## Setting Up the Project

1. Clone the repository:

```bash
git clone https://github.com/Shironex/gh-labels-cli.git
cd gh-labels-cli
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the CLI in development mode:

```bash
pnpm dev
```

For specific commands, you can add them after the dev command:

```bash
pnpm dev add-labels
pnpm dev get-labels
```

## GitHub Token Setup

GitHub Labels CLI requires a Personal Access Token to access your repositories. You can set it up in two ways:

1. As an environment variable `GITHUB_TOKEN`:

   ```
   GITHUB_TOKEN=your_github_token
   ```

   You can add this to a `.env` file in the project root:

   ```
   # .env file
   GITHUB_TOKEN=your_github_token
   ```

2. When prompted during interactive mode.

### Creating a GitHub Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" and select "Generate new token (classic)"
3. Give your token a descriptive name
4. Select the `repo` scope to allow managing repository labels
5. Click "Generate token" and copy the token
