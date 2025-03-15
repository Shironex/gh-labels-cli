# Basic Commands

This guide covers the fundamental commands available in GitHub Labels CLI. Each command is explained with examples and common use cases.

## Viewing Labels

### List Labels in a Repository

::: code-group

```bash [Default]
gh-labels list owner/repo
```

```bash [JSON Output]
gh-labels list owner/repo --format json
```

```bash [Table Output]
gh-labels list owner/repo --format table
```

:::

### Get Label Details

::: code-group

```bash [Default]
gh-labels get owner/repo "bug"
```

```bash [With Format]
gh-labels get owner/repo "bug" --format json
```

:::

## Creating Labels

### Create a Single Label

::: code-group

```bash [Basic]
gh-labels add owner/repo "feature" --color "#0366d6"
```

```bash [With Description]
gh-labels add owner/repo "feature" --color "#0366d6" --description "New feature or request"
```

```bash [Force Update]
gh-labels add owner/repo "feature" --color "#0366d6" --force
```

:::

### Create Multiple Labels from a Template

::: code-group

```bash [Basic]
gh-labels add-labels owner/repo --template standard
```

```bash [With Force]
gh-labels add-labels owner/repo --template standard --force
```

```bash [Custom Template]
gh-labels add-labels owner/repo --template ./my-template.json
```

:::

## Updating Labels

### Update Label Properties

::: code-group

```bash [Update Color]
gh-labels update owner/repo "bug" --color "#d73a4a"
```

```bash [Update Description]
gh-labels update owner/repo "bug" --description "Something isn't working"
```

```bash [Update Both]
gh-labels update owner/repo "bug" --color "#d73a4a" --description "Something isn't working"
```

:::

### Rename a Label

::: code-group

```bash [Basic]
gh-labels rename owner/repo "bug" "issue"
```

```bash [With Force]
gh-labels rename owner/repo "bug" "issue" --force
```

:::

## Deleting Labels

### Delete Labels

::: code-group

```bash [Single Label]
gh-labels delete owner/repo "wontfix"
```

```bash [Multiple Labels]
gh-labels delete owner/repo "duplicate" "invalid" "wontfix"
```

```bash [Force Delete]
gh-labels delete owner/repo "wontfix" --force
```

:::

## Working with Templates

### Template Management

::: code-group

```bash [List Templates]
gh-labels templates list
```

```bash [Show Template]
gh-labels templates show standard
```

```bash [Create Template]
gh-labels templates create my-template
```

:::

## Synchronizing Labels

### Copy Labels Between Repositories

::: code-group

```bash [Basic Sync]
gh-labels sync source-owner/repo target-owner/repo
```

```bash [Dry Run]
gh-labels sync source-owner/repo target-owner/repo --dry-run
```

```bash [Force Sync]
gh-labels sync source-owner/repo target-owner/repo --force
```

:::

### Apply Template to Multiple Repositories

::: code-group

```bash [Basic Apply]
gh-labels sync-template standard owner/repo1 owner/repo2
```

```bash [With Options]
gh-labels sync-template standard owner/repo1 owner/repo2 --force --delete-existing
```

:::

## Common Options

These options are available for most commands:

::: code-group

```bash [Authentication]
gh-labels <command> --token "your-github-token"
```

```bash [Output Format]
gh-labels <command> --format json
```

```bash [Quiet Mode]
gh-labels <command> --quiet
```

```bash [No Confirm]
gh-labels <command> --no-confirm
```

:::

## Using Default Repository

If you've set a default repository in your configuration:

::: code-group

```bash [Set Default]
gh-labels config set defaultRepo "owner/repo"
```

```bash [Use Default]
gh-labels list  # Lists labels from default repository
```

:::

## Getting Help

::: code-group

```bash [General Help]
gh-labels --help
```

```bash [Command Help]
gh-labels add --help
```

```bash [Version]
gh-labels --version
```

:::
