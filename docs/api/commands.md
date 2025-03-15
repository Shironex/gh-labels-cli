# Commands API

The Commands API provides the core functionality for the GitHub Labels CLI. Each command is implemented as a separate module that handles specific label management operations.

## Command Structure

Each command follows a consistent structure:

```typescript
export interface Command {
  name: string;
  description: string;
  execute(args: string[]): Promise<void>;
  buildOptions(program: Command): void;
}
```

## Available Commands

### List Labels

```typescript
import { ListCommand } from 'gh-labels-cli/commands';

const command = new ListCommand();
await command.execute(['owner/repo']);
```

Options:

- `format`: Output format ('json' | 'table')
- `quiet`: Suppress output

### Add Label

```typescript
import { AddCommand } from 'gh-labels-cli/commands';

const command = new AddCommand();
await command.execute([
  'owner/repo',
  'bug',
  '--color',
  '#d73a4a',
  '--description',
  "Something isn't working",
]);
```

Options:

- `color`: Label color (hex)
- `description`: Label description
- `force`: Overwrite if exists

### Update Label

```typescript
import { UpdateCommand } from 'gh-labels-cli/commands';

const command = new UpdateCommand();
await command.execute(['owner/repo', 'bug', '--color', '#ff0000']);
```

Options:

- `color`: New color
- `description`: New description
- `name`: New name

### Delete Label

```typescript
import { DeleteCommand } from 'gh-labels-cli/commands';

const command = new DeleteCommand();
await command.execute(['owner/repo', 'wontfix']);
```

Options:

- `force`: Skip confirmation
- `quiet`: Suppress output

### Sync Labels

```typescript
import { SyncCommand } from 'gh-labels-cli/commands';

const command = new SyncCommand();
await command.execute(['source/repo', 'target/repo']);
```

Options:

- `dry-run`: Preview changes
- `force`: Overwrite existing
- `delete`: Remove extra labels

### Template Commands

#### List Templates

```typescript
import { TemplatesListCommand } from 'gh-labels-cli/commands';

const command = new TemplatesListCommand();
await command.execute([]);
```

#### Apply Template

```typescript
import { TemplatesApplyCommand } from 'gh-labels-cli/commands';

const command = new TemplatesApplyCommand();
await command.execute(['standard', 'owner/repo']);
```

Options:

- `force`: Overwrite existing
- `dry-run`: Preview changes

## Creating Custom Commands

You can create custom commands by implementing the `Command` interface:

```typescript
import { Command } from 'gh-labels-cli/types';

export class CustomCommand implements Command {
  name = 'custom';
  description = 'My custom command';

  async execute(args: string[]): Promise<void> {
    // Implementation
  }

  buildOptions(program: Command): void {
    program.option('-o, --option <value>', 'Custom option').option('-f, --flag', 'Boolean flag');
  }
}
```

## Command Helpers

### Argument Parsing

```typescript
import { parseArgs } from 'gh-labels-cli/utils';

const args = parseArgs(process.argv.slice(2));
```

### Output Formatting

```typescript
import { formatOutput } from 'gh-labels-cli/utils';

const output = formatOutput(data, {
  format: 'json',
  colors: true,
});
```

### Error Handling

```typescript
import { handleError } from 'gh-labels-cli/utils';

try {
  await command.execute(args);
} catch (error) {
  handleError(error);
}
```

## Best Practices

1. **Input Validation**

   ```typescript
   if (!args.length) {
     throw new Error('Repository argument required');
   }
   ```

2. **Progress Indication**

   ```typescript
   import { spinner } from 'gh-labels-cli/utils';

   spinner.start('Processing...');
   try {
     await operation();
     spinner.succeed('Done');
   } catch (error) {
     spinner.fail('Failed');
     throw error;
   }
   ```

3. **Confirmation Prompts**

   ```typescript
   import { confirm } from 'gh-labels-cli/utils';

   if (await confirm('Continue?')) {
     // Proceed
   }
   ```

## Testing Commands

```typescript
import { TestCommand } from 'gh-labels-cli/test';

describe('CustomCommand', () => {
  it('should execute successfully', async () => {
    const command = new CustomCommand();
    const result = await command.execute(['test/repo']);
    expect(result).toBeDefined();
  });
});
```
