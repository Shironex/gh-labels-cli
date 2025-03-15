# Installation

You can install GitHub Labels CLI using your preferred package manager. The package is available on npm and can be installed globally or locally in your project.

## Global Installation

::: code-group

```bash [npm]
npm install -g gh-labels-cli
```

```bash [pnpm]
pnpm add -g gh-labels-cli
```

```bash [yarn]
yarn global add gh-labels-cli
```

:::

## Local Installation

::: code-group

```bash [npm]
npm install gh-labels-cli
```

```bash [pnpm]
pnpm add gh-labels-cli
```

```bash [yarn]
yarn add gh-labels-cli
```

:::

## GitHub Authentication

1. Generate a GitHub Personal Access Token:

   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Click "Generate new token"
   - Select the necessary scopes:
     - `repo` (for private repositories)
     - `public_repo` (for public repositories)
   - Copy the generated token

2. Configure the CLI:
   ::: code-group

   ```bash [Command]
   gh-labels config set token YOUR_GITHUB_TOKEN
   ```

   ```bash [Environment Variable]
   export GH_LABELS_TOKEN="your-github-token"
   ```

   :::
   Replace `YOUR_GITHUB_TOKEN` with the token you generated.

## Verifying Installation

To verify that the installation was successful, run:

```bash
gh-labels --version
```

You should see the current version number of the tool.

## Next Steps

Now that you have GitHub Labels CLI installed and configured, you can:

- Learn about the [basic commands](./basic-commands)
- Explore the [configuration options](./configuration)
- Start [working with labels](./working-with-labels)
