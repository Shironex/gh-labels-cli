# Configuration

GitHub Labels CLI can be configured to match your workflow preferences. This guide covers all available configuration options and how to use them.

## Configuration File

The tool uses a configuration file located at `~/.config/gh-labels/config.json`. This file is created automatically when you first configure the tool.

## Setting Up Authentication

### GitHub Token

Set your GitHub Personal Access Token:

```bash
gh-labels config set token YOUR_GITHUB_TOKEN
```

To verify your token is set:

```bash
gh-labels config get token
```

## Default Settings

### Default Repository

Set a default repository to work with:

```bash
gh-labels config set defaultRepo "owner/repo"
```

### Output Format

Configure the default output format:

```bash
gh-labels config set outputFormat "json"  # or "table"
```

## Label Templates

### Custom Templates Directory

Set a custom directory for your label templates:

```bash
gh-labels config set templatesDir "~/my-label-templates"
```

### Default Template

Set a default template to use when creating new labels:

```bash
gh-labels config set defaultTemplate "standard"
```

## Global Options

### Color Format

Choose between different color formats:

```bash
gh-labels config set colorFormat "hex"  # or "rgb"
```

### Confirmation Prompts

Enable or disable confirmation prompts:

```bash
gh-labels config set confirmActions true
```

## Configuration Commands

View all current settings:

```bash
gh-labels config list
```

Reset a specific setting:

```bash
gh-labels config reset <setting-name>
```

Reset all settings to defaults:

```bash
gh-labels config reset --all
```

## Environment Variables

You can also use environment variables to override configuration:

- `GH_LABELS_TOKEN` - GitHub Personal Access Token
- `GH_LABELS_DEFAULT_REPO` - Default repository
- `GH_LABELS_OUTPUT_FORMAT` - Output format
- `GH_LABELS_TEMPLATES_DIR` - Templates directory

Example:

```bash
export GH_LABELS_TOKEN="your-token-here"
```

## Configuration File Structure

The configuration file (`config.json`) follows this structure:

```json
{
  "token": "your-github-token",
  "defaultRepo": "owner/repo",
  "outputFormat": "table",
  "templatesDir": "~/label-templates",
  "defaultTemplate": "standard",
  "colorFormat": "hex",
  "confirmActions": true
}
```

## Best Practices

1. **Token Security**: Never commit your GitHub token or share it publicly
2. **Templates**: Keep label templates in version control for team sharing
3. **Default Repo**: Set a default repo to minimize typing for frequent operations
4. **Output Format**: Use JSON format for scripting, table format for readability
