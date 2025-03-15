# Interactive Mode

GitHub Labels CLI provides an interactive mode that makes it easier to manage labels through a series of prompts and menus. This guide covers how to use the interactive features effectively.

## Starting Interactive Mode

Launch the interactive mode:

```bash
gh-labels interactive
```

Or use the shorthand:

```bash
gh-labels i
```

## Navigation

The interactive mode provides a menu-driven interface where you can:

- Navigate using arrow keys
- Select options with Enter
- Go back with Escape
- Exit with Ctrl+C

## Main Menu Options

### 1. Repository Selection

```
? Select repository:
❯ Current: owner/repo
  Change repository
  List repositories
```

### 2. Label Management

```
? Choose action:
❯ View labels
  Create label
  Edit label
  Delete label
  Apply template
  Sync with another repository
```

## Creating Labels Interactively

When creating a new label, you'll be prompted for:

1. Label name:

```
? Enter label name: feature
```

2. Description:

```
? Enter label description: New feature or enhancement
```

3. Color (with preview):

```
? Choose label color: (#0366d6)
  [Preview: ██████]
```

## Editing Labels

When editing a label, you'll first select from existing labels:

```
? Select label to edit:
❯ bug        🔴 Something isn't working
  feature    🔵 New feature or enhancement
  docs       📘 Documentation updates
```

Then choose what to modify:

```
? What would you like to edit?
❯ Name
  Description
  Color
  All properties
```

## Working with Templates

### Applying Templates

1. Select a template:

```
? Choose template:
❯ standard
  minimal
  custom
```

2. Confirm actions:

```
? The following labels will be created:
  - bug        🔴
  - feature    🔵
  - docs       📘
  Proceed? (Y/n)
```

### Creating Templates

Save current repository labels as a template:

```
? Enter template name: my-template
? Description: My custom label set
```

## Synchronizing Repositories

1. Select source:

```
? Select source:
❯ Current repository
  Another repository
  Template
```

2. Select target:

```
? Select target repository:
❯ owner/repo1
  owner/repo2
  Enter manually
```

3. Review changes:

```
? The following changes will be made:
  + 3 labels to add
  ~ 2 labels to update
  - 1 label to remove
  Proceed? (Y/n)
```

## Bulk Operations

### Multi-select Mode

Some operations support selecting multiple items:

```
? Select labels to delete: (Press <space> to select)
❯ ◯ wontfix
  ◯ duplicate
  ◯ invalid
```

### Batch Processing

When applying changes to multiple items:

```
? Processing 3 items:
  ⠋ Processing... (1/3)
```

## Configuration in Interactive Mode

Access configuration settings:

```
? Configuration options:
❯ View current settings
  Edit settings
  Reset to defaults
```

## Tips for Interactive Mode

1. **Quick Navigation**

   - Type to filter lists
   - Use number keys (1-9) for quick selection
   - Press `?` for help

2. **Color Selection**

   - Use hex codes directly
   - Choose from presets
   - Preview colors in terminal

3. **Keyboard Shortcuts**

   - `Ctrl+C`: Exit
   - `Esc`: Go back
   - `Space`: Select in multi-select mode
   - `Enter`: Confirm selection

4. **Confirmation Prompts**
   - Can be disabled in configuration
   - Use `--no-confirm` flag to skip
