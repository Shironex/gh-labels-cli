# Configuration API

The Configuration API provides a robust system for managing user settings, defaults, and runtime configuration for the GitHub Labels CLI.

## Configuration Manager

### Initialization

```typescript
import { ConfigManager } from 'gh-labels-cli/config';

const config = new ConfigManager({
  configPath: '~/.config/gh-labels/config.json',
});
```

## Reading Configuration

### Get All Settings

```typescript
const settings = config.getAll();
```

### Get Specific Setting

```typescript
const token = config.get('token');
const defaultRepo = config.get('defaultRepo');
```

### Default Values

```typescript
const value = config.get('setting', 'default-value');
```

## Writing Configuration

### Set Single Value

```typescript
await config.set('token', 'your-github-token');
```

### Set Multiple Values

```typescript
await config.setMultiple({
  token: 'your-github-token',
  defaultRepo: 'owner/repo',
});
```

### Update Configuration

```typescript
await config.update({
  token: 'new-token',
  outputFormat: 'json',
});
```

## Configuration Schema

### Basic Structure

```typescript
interface Config {
  token?: string;
  defaultRepo?: string;
  outputFormat?: 'json' | 'table';
  colorFormat?: 'hex' | 'rgb';
  templatesDir?: string;
  confirmActions?: boolean;
}
```

### Validation

```typescript
import { validateConfig } from 'gh-labels-cli/config/validation';

const isValid = validateConfig(config);
if (!isValid) {
  console.error(validateConfig.errors);
}
```

## Environment Variables

### Available Variables

```typescript
const envVars = {
  GH_LABELS_TOKEN: 'GitHub token',
  GH_LABELS_DEFAULT_REPO: 'Default repository',
  GH_LABELS_OUTPUT_FORMAT: 'Output format',
  GH_LABELS_COLOR_FORMAT: 'Color format',
  GH_LABELS_TEMPLATES_DIR: 'Templates directory',
  GH_LABELS_NO_CONFIRM: 'Skip confirmations',
};
```

### Reading Environment

```typescript
import { getEnvConfig } from 'gh-labels-cli/config/env';

const envConfig = getEnvConfig();
```

## File Operations

### Reading Config File

```typescript
const fileConfig = await config.readFile();
```

### Writing Config File

```typescript
await config.writeFile(newConfig);
```

### File Location

```typescript
import { getConfigPath } from 'gh-labels-cli/config/paths';

const configPath = getConfigPath();
// Returns: ~/.config/gh-labels/config.json
```

## Configuration Merging

### Precedence Order

1. Command-line arguments
2. Environment variables
3. Configuration file
4. Default values

```typescript
import { mergeConfig } from 'gh-labels-cli/config/merge';

const finalConfig = mergeConfig({
  cli: cliArgs,
  env: envConfig,
  file: fileConfig,
  defaults: defaultConfig,
});
```

## Runtime Configuration

### Creating Runtime Config

```typescript
import { RuntimeConfig } from 'gh-labels-cli/config/runtime';

const runtime = new RuntimeConfig({
  baseConfig: config,
  overrides: {
    token: 'cli-provided-token',
  },
});
```

### Using Runtime Config

```typescript
const value = runtime.get('setting');
await runtime.set('setting', 'value');
```

## Configuration Events

### Event Handling

```typescript
config.on('change', (key, value) => {
  console.log(`Config changed: ${key} = ${value}`);
});

config.on('error', error => {
  console.error('Configuration error:', error);
});
```

## Migration

### Version Migration

```typescript
import { migrateLegacyConfig } from 'gh-labels-cli/config/migration';

const oldConfig = await readLegacyConfig();
const newConfig = await migrateLegacyConfig(oldConfig);
```

## Best Practices

### Type Safety

```typescript
import { Config } from 'gh-labels-cli/config/types';

function useConfig(config: Config) {
  const token = config.token;
  // TypeScript knows token is string | undefined
}
```

### Error Handling

```typescript
try {
  await config.set('invalid-key', 'value');
} catch (error) {
  if (error.code === 'INVALID_KEY') {
    console.error('Invalid configuration key');
  }
}
```

### Configuration Backup

```typescript
import { backupConfig } from 'gh-labels-cli/config/backup';

// Create backup
await backupConfig();

// Restore from backup
await restoreConfig('backup-2024-01-01.json');
```

### Secure Storage

```typescript
import { SecureStorage } from 'gh-labels-cli/config/secure';

const secure = new SecureStorage();
await secure.saveToken('your-github-token');
const token = await secure.getToken();
```
