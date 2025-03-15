# GitHub Integration API

The GitHub Integration API provides a clean interface for interacting with GitHub's REST API, specifically focused on label management operations.

## GitHub Client

### Initialization

```typescript
import { GitHubClient } from 'gh-labels-cli/github';

const client = new GitHubClient({
  token: 'your-github-token',
  baseUrl: 'https://api.github.com', // Optional
  userAgent: 'gh-labels-cli', // Optional
});
```

### Authentication

```typescript
// Using personal access token
const client = new GitHubClient({
  token: process.env.GITHUB_TOKEN,
});

// Using OAuth token
const client = new GitHubClient({
  token: oauthToken,
  tokenType: 'oauth',
});
```

## Label Operations

### Fetching Labels

```typescript
// List all labels
const labels = await client.labels.list({
  owner: 'username',
  repo: 'repository',
});

// Get single label
const label = await client.labels.get({
  owner: 'username',
  repo: 'repository',
  name: 'bug',
});
```

### Creating Labels

```typescript
const newLabel = await client.labels.create({
  owner: 'username',
  repo: 'repository',
  name: 'feature',
  color: '0366d6',
  description: 'New feature request',
});
```

### Updating Labels

```typescript
const updatedLabel = await client.labels.update({
  owner: 'username',
  repo: 'repository',
  name: 'bug',
  newName: 'issue', // Optional
  color: 'ff0000', // Optional
  description: 'Updated', // Optional
});
```

### Deleting Labels

```typescript
await client.labels.delete({
  owner: 'username',
  repo: 'repository',
  name: 'wontfix',
});
```

## Error Handling

### API Errors

```typescript
import { GitHubError } from 'gh-labels-cli/github/errors';

try {
  await client.labels.create(/* ... */);
} catch (error) {
  if (error instanceof GitHubError) {
    console.error(`GitHub API Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
    console.error(`Response: ${error.response}`);
  }
}
```

### Rate Limiting

```typescript
import { RateLimitError } from 'gh-labels-cli/github/errors';

try {
  await client.labels.list(/* ... */);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(`Rate limit exceeded. Reset at: ${error.resetAt}`);
  }
}
```

## Advanced Features

### Pagination

```typescript
// Automatic pagination
const allLabels = await client.labels.listAll({
  owner: 'username',
  repo: 'repository',
});

// Manual pagination
const options = {
  per_page: 30,
  page: 1,
};

const page = await client.labels.list({
  owner: 'username',
  repo: 'repository',
  ...options,
});
```

### Batch Operations

```typescript
// Create multiple labels
await client.labels.createBatch({
  owner: 'username',
  repo: 'repository',
  labels: [
    { name: 'bug', color: 'ff0000' },
    { name: 'feature', color: '0366d6' },
  ],
});

// Delete multiple labels
await client.labels.deleteBatch({
  owner: 'username',
  repo: 'repository',
  names: ['wontfix', 'invalid'],
});
```

### Repository Validation

```typescript
// Check repository exists
const exists = await client.repository.exists({
  owner: 'username',
  repo: 'repository',
});

// Check write access
const hasAccess = await client.repository.checkAccess({
  owner: 'username',
  repo: 'repository',
  permission: 'write',
});
```

## Utilities

### URL Building

```typescript
import { buildUrl } from 'gh-labels-cli/github/utils';

const url = buildUrl({
  owner: 'username',
  repo: 'repository',
  endpoint: 'labels',
});
```

### Response Parsing

```typescript
import { parseResponse } from 'gh-labels-cli/github/utils';

const response = await fetch(url);
const data = await parseResponse(response);
```

### Rate Limit Handling

```typescript
import { RateLimitHandler } from 'gh-labels-cli/github/rate-limit';

const handler = new RateLimitHandler();

await handler.execute(async () => {
  // API calls here
});
```

## Types

### Label Types

```typescript
interface Label {
  name: string;
  color: string;
  description?: string;
}

interface LabelUpdate extends Partial<Label> {
  newName?: string;
}
```

### API Response Types

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

interface ErrorResponse {
  message: string;
  documentation_url?: string;
}
```

## Best Practices

1. **Error Handling**

   ```typescript
   try {
     await client.labels.create(/* ... */);
   } catch (error) {
     if (error.status === 404) {
       // Repository not found
     } else if (error.status === 422) {
       // Validation error
     }
   }
   ```

2. **Rate Limiting**

   ```typescript
   const handler = new RateLimitHandler({
     maxRetries: 3,
     retryDelay: 1000,
   });
   ```

3. **Batch Operations**
   ```typescript
   // Use batch operations for multiple items
   await client.labels.createBatch({
     labels: labelArray,
     continueOnError: true,
   });
   ```
