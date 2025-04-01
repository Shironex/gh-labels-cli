# Label Best Practices

This guide provides recommendations for creating and managing effective GitHub labels for your repositories.

## Label Structure

A GitHub label consists of three components:

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

## Creating Effective Labels

### Naming Conventions

Good label names should be:

- **Clear and concise**: Use short, descriptive names
- **Consistent**: Maintain a uniform naming pattern
- **Meaningful**: Names should clearly indicate the label's purpose

Consider using prefixes to categorize labels:

```
type: bug, feature, docs
priority: high, medium, low
status: in-progress, review, blocked
```

### Color Selection

Strategic color use improves visual scanning and organization:

- Use contrasting colors for different label categories
- Maintain color consistency within categories
- Consider using color intensity to indicate priority or importance

Common color associations:

- Red (`#d73a4a`): Bugs, issues, problems
- Blue (`#0366d6`): Features, enhancements
- Green (`#0e8a16`): Documentation, tests
- Yellow (`#fbca04`): Warnings, needs attention
- Purple (`#6f42c1`): Infrastructure, configuration

### Writing Good Descriptions

Descriptions help team members understand when to use each label:

- Keep descriptions under 100 characters
- Explain the label's purpose clearly
- Include context for when the label should be applied

## Label Categories for Pull Requests

Organize your labels into these recommended categories:

### 1. Type Labels

Indicate what kind of change the PR represents:

```
bug: Something isn't working
feature: New functionality
docs: Documentation changes
refactor: Code restructuring without functionality changes
test: Adding or fixing tests
chore: Maintenance tasks, dependencies
```

### 2. Status Labels

Track the PR's current state:

```
in-progress: Work is ongoing
ready-for-review: Ready for code review
needs-changes: Changes requested during review
approved: Approved and ready to merge
blocked: Blocked by external factors
```

### 3. Priority Labels

Communicate importance and urgency:

```
priority:high: Urgent attention needed
priority:medium: Standard priority
priority:low: Address when time permits
```

### 4. Scope Labels

Indicate which parts of the codebase are affected:

```
scope:frontend: Changes to frontend code
scope:backend: Changes to backend code
scope:api: API-related changes
scope:ui: User interface modifications
```

## Sample Label Set

Here's a starter set of well-designed labels:

```json
[
  {
    "name": "bug",
    "color": "d73a4a",
    "description": "Something isn't working correctly"
  },
  {
    "name": "feature",
    "color": "0366d6",
    "description": "New feature or request"
  },
  {
    "name": "documentation",
    "color": "0075ca",
    "description": "Improvements or additions to documentation"
  },
  {
    "name": "enhancement",
    "color": "a2eeef",
    "description": "Enhancement to existing features"
  },
  {
    "name": "good first issue",
    "color": "7057ff",
    "description": "Good for newcomers"
  },
  {
    "name": "help wanted",
    "color": "008672",
    "description": "Extra attention is needed"
  },
  {
    "name": "priority:high",
    "color": "d93f0b",
    "description": "Needs immediate attention"
  },
  {
    "name": "priority:medium",
    "color": "fbca04",
    "description": "Address soon"
  },
  {
    "name": "priority:low",
    "color": "0e8a16",
    "description": "Address when time permits"
  }
]
```

## Tips for Label Management

1. **Be selective**: Don't create too many labels—aim for 10-15 core labels
2. **Review periodically**: Remove unused labels or add new ones as project needs evolve
3. **Document your system**: Make sure your team understands the labeling system
4. **Be consistent**: Apply labels consistently across all repositories in your organization
