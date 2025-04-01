# Label Templates

GitHub Labels CLI allows you to manage and use different label templates to organize your repositories consistently.

## What are Label Templates?

Label templates are JSON files containing predefined sets of labels with their names, colors, and descriptions. These templates can be:

- Used to add consistent labels across multiple repositories
- Customized for different types of projects
- Shared with team members or the community

## Templates Location

All label templates are stored in the `src/labels/` directory of the project:

- `default.json` - The default template included with the tool
- Repository-specific templates are automatically created when you use the `get-labels` command
- Custom templates that you create manually

## Complete Label Management

GitHub Labels CLI provides a complete set of tools for managing labels:

1. **Adding labels** - Apply labels from templates to repositories
2. **Exporting labels** - Save existing repository labels as templates
3. **Removing labels** - Clean up unwanted or outdated labels from repositories

This full lifecycle management allows you to keep your repositories organized and consistent.

## Using Templates

When you run the `add-labels` command, you'll be prompted to select a template if multiple templates are available. The selected template's labels will then be presented for you to choose from.

## Default Template

The default template (`src/labels/default.json`) includes a set of commonly used labels for GitHub projects.

## Creating Custom Templates

You can create your own custom label templates:

1. Create a new JSON file in the `src/labels/` directory with a descriptive name
2. Structure your file as an array of label objects:

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

### Label Format

Each label in your template must include:

- `name` (string): The name of the label (required)
- `color` (string): A 6-character hex color code WITHOUT the `#` prefix (required)
- `description` (string): A description of when to use the label (optional but recommended)

### Template Naming

Choose descriptive names for your templates based on their purpose:

- `agile-workflow.json` - Labels for Agile development
- `open-source.json` - Labels for open-source projects
- `bug-tracking.json` - Labels focused on bug categorization

## Exporting Labels from Repositories

You can create new templates by exporting labels from existing repositories:

```bash
pnpm dev get-labels
```

This will save all labels from the selected repository to a new JSON file in the `src/labels/` directory, named after the repository (e.g., `owner-repo.json`).

## Sharing Templates

To share your label templates with others:

1. Create a pull request to the GitHub Labels CLI repository with your new template
2. Share your JSON file directly with teammates
3. Include your template in your project's documentation

## Template Best Practices

For effective label templates:

1. **Be consistent** in naming conventions and color schemes
2. **Limit the number** of labels to 10-15 for most projects
3. **Group related labels** by using consistent prefixes or colors
4. **Include clear descriptions** that explain when each label should be used
5. **Review periodically** and update templates as your workflow evolves

See the [Label Best Practices](./best-practices) guide for more detailed recommendations on creating effective labels.
