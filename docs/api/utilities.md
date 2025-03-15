# Utilities API

The Utilities API provides a collection of helper functions and shared code used throughout the GitHub Labels CLI. These utilities handle common tasks and provide consistent behavior across the application.

## Color Utilities

### Color Manipulation

```typescript
import { ColorUtils } from 'gh-labels-cli/utils/color';

// Convert hex to RGB
const rgb = ColorUtils.hexToRgb('#ff0000');
// => { r: 255, g: 0, b: 0 }

// Convert RGB to hex
const hex = ColorUtils.rgbToHex(255, 0, 0);
// => 'ff0000'

// Validate color format
const isValid = ColorUtils.isValidColor('#ff0000');
// => true

// Generate random color
const randomColor = ColorUtils.randomColor();
// => 'ff5733'
```

## String Utilities

### Text Formatting

```typescript
import { formatText } from 'gh-labels-cli/utils/string';

// Truncate text
const truncated = formatText.truncate('Long text', 5);
// => 'Long...'

// Pad string
const padded = formatText.pad('Text', 10);
// => 'Text      '

// Case conversion
const camel = formatText.toCamelCase('my-variable');
// => 'myVariable'
```

### String Validation

```typescript
import { validate } from 'gh-labels-cli/utils/string';

// Check if valid label name
const isValid = validate.isValidLabelName('feature/request');
// => true

// Check if valid color code
const isValidColor = validate.isValidColorCode('ff0000');
// => true
```

## Output Formatting

### Console Output

```typescript
import { output } from 'gh-labels-cli/utils/output';

// Success message
output.success('Operation completed');

// Error message
output.error('Something went wrong');

// Info message
output.info('Processing...');

// Warning message
output.warn('Proceed with caution');
```

### Table Formatting

```typescript
import { table } from 'gh-labels-cli/utils/table';

const data = [
  { name: 'bug', color: 'ff0000' },
  { name: 'feature', color: '0000ff' },
];

// Create table
const formattedTable = table.create(data, {
  columns: ['name', 'color'],
  header: true,
});

// Print table
table.print(formattedTable);
```

## File System Utilities

### File Operations

```typescript
import { fs } from 'gh-labels-cli/utils/fs';

// Read JSON file
const data = await fs.readJson('config.json');

// Write JSON file
await fs.writeJson('config.json', data);

// Ensure directory exists
await fs.ensureDir('templates');

// Check if file exists
const exists = await fs.exists('config.json');
```

### Path Handling

```typescript
import { paths } from 'gh-labels-cli/utils/paths';

// Get home directory
const home = paths.getHomeDir();

// Resolve path
const fullPath = paths.resolve('~/config.json');

// Join paths
const path = paths.join(home, '.config', 'gh-labels');
```

## HTTP Utilities

### Request Handling

```typescript
import { http } from 'gh-labels-cli/utils/http';

// Make GET request
const response = await http.get('https://api.github.com/repos');

// Make POST request with data
const result = await http.post('https://api.github.com/labels', {
  name: 'bug',
  color: 'ff0000',
});

// Handle errors
try {
  await http.request(url, options);
} catch (error) {
  if (http.isNetworkError(error)) {
    // Handle network error
  }
}
```

## Validation Utilities

### Input Validation

```typescript
import { validate } from 'gh-labels-cli/utils/validation';

// Validate required fields
const isValid = validate.required({
  name: 'label',
  color: 'ff0000',
});

// Validate format
const hasValidFormat = validate.format('label-name', /^[a-z-]+$/);
```

## Progress Indicators

### Spinners

```typescript
import { spinner } from 'gh-labels-cli/utils/spinner';

// Start spinner
spinner.start('Loading...');

// Update text
spinner.text = 'Still loading...';

// Stop with success
spinner.succeed('Done!');

// Stop with error
spinner.fail('Failed!');
```

## Error Handling

### Error Utilities

```typescript
import { errors } from 'gh-labels-cli/utils/errors';

// Create error
const error = errors.create('ValidationError', 'Invalid input');

// Check error type
if (errors.isValidationError(error)) {
  // Handle validation error
}

// Format error message
const message = errors.format(error);
```

## Date Utilities

### Date Formatting

```typescript
import { dates } from 'gh-labels-cli/utils/dates';

// Format date
const formatted = dates.format(new Date());
// => '2024-01-01 12:00:00'

// Parse date string
const date = dates.parse('2024-01-01');

// Get relative time
const relative = dates.relative(date);
// => '2 hours ago'
```

## Object Utilities

### Object Manipulation

```typescript
import { objects } from 'gh-labels-cli/utils/objects';

// Deep merge
const merged = objects.merge(obj1, obj2);

// Pick properties
const picked = objects.pick(obj, ['name', 'color']);

// Omit properties
const omitted = objects.omit(obj, ['internal']);
```

## Testing Utilities

### Test Helpers

```typescript
import { testing } from 'gh-labels-cli/utils/testing';

// Mock file system
testing.mockFs({
  'config.json': '{"token": "test"}',
});

// Mock HTTP responses
testing.mockHttp({
  'GET /repos': [{ name: 'repo' }],
});

// Clean up
testing.cleanup();
```
