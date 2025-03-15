# Working with Labels

This guide provides detailed information about working with GitHub labels, including best practices, advanced usage patterns, and tips for maintaining a consistent labeling system across repositories.

## Label Structure

A GitHub label consists of three main components:

1. **Name**: The label's identifier (required)
2. **Color**: A hex color code (required)
3. **Description**: A short explanation (optional)

Example:

```json
{
  "name": "bug",
  "color": "d73a4a",
  "description": "Something isn't working"
}
```

## Label Best Practices

### Naming Conventions

1. **Be Consistent**

   - Use lowercase for consistency
   - Avoid spaces (use hyphens or colons)
   - Keep names short but descriptive

2. **Hierarchical Labels**

   ```
   type:bug
   type:feature
   priority:high
   priority:low
   ```

3. **Semantic Prefixes**
   ```
   status:ready
   scope:frontend
   effort:large
   ```

### Color Schemes

1. **Color Categories**

   - Red: Issues, bugs
   - Green: Features, enhancements
   - Blue: Documentation, support
   - Yellow: Warnings, attention needed
   - Purple: Tasks, chores

2. **Color Intensity**
   - Brighter colors for higher priority
   - Softer colors for maintenance tasks
   - Consistent shades within categories

### Descriptions

1. **Clear and Concise**

   - Use active voice
   - Keep under 100 characters
   - Explain when to use the label

2. **Include Examples**
   ```
   Label: "regression"
   Description: "Previously working feature now broken"
   ```

## Label Templates

### Standard Template

The default template includes common labels:

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
  },
  {
    "name": "documentation",
    "color": "0075ca",
    "description": "Documentation improvements"
  }
]
```

### Creating Custom Templates

1. **Export Current Labels**

```bash
gh-labels export owner/repo > my-template.json
```

2. **Edit Template**

```json
[
  {
    "name": "custom-label",
    "color": "ff0000",
    "description": "My custom label"
  }
]
```

3. **Save as Template**

```bash
gh-labels templates create --file my-template.json
```

## Advanced Usage

### Bulk Operations

1. **Apply Multiple Labels**

```bash
gh-labels add-labels owner/repo --labels "bug,feature,docs"
```

2. **Update Color Scheme**

```bash
gh-labels update owner/repo "type:*" --color "#ff0000"
```

### Label Synchronization

1. **Between Repositories**

```bash
gh-labels sync source/repo target/repo --dry-run
```

2. **Using Templates**

```bash
gh-labels sync-template standard owner/repo --force
```

### Label Migrations

1. **Export Labels**

```bash
gh-labels export owner/repo > labels-backup.json
```

2. **Import Labels**

```bash
gh-labels import owner/repo labels-backup.json
```

## Organization-wide Labels

### Setting Up Standard Labels

1. Create a template repository
2. Define your organization's standard labels
3. Use sync command to apply to other repositories

```bash
gh-labels sync org-template/repo org/*/repo
```

### Maintaining Consistency

1. **Regular Audits**

```bash
gh-labels list owner/repo --format json | jq '.[] | .name'
```

2. **Automated Sync**

```bash
gh-labels sync-template standard owner/repo --schedule daily
```

## Integration with GitHub Actions

### Automated Label Management

```yaml
name: Sync Labels
on:
  push:
    paths:
      - '.github/labels.json'
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Sync labels
        run: |
          gh-labels sync-template .github/labels.json ${{ github.repository }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Troubleshooting

### Common Issues

1. **Label Already Exists**

   - Use `--force` to overwrite
   - Use `--skip-existing` to ignore

2. **Permission Errors**

   - Check token permissions
   - Verify repository access

3. **Color Format**
   - Remove '#' from hex codes
   - Use 6-character hex values

### Validation

1. **Check Label Format**

```bash
gh-labels validate my-template.json
```

2. **Dry Run Operations**

```bash
gh-labels sync source/repo target/repo --dry-run
```
