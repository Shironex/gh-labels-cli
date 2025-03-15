# Types API

This documentation covers the TypeScript type definitions used throughout the GitHub Labels CLI. These types ensure type safety and provide better development experience through IntelliSense support.

## Core Types

### Label Types

```typescript
interface Label {
  name: string;
  color: string;
  description?: string;
}

interface LabelCreate extends Label {
  force?: boolean;
}

interface LabelUpdate extends Partial<Label> {
  currentName: string;
  newName?: string;
}

type LabelIdentifier =
  | string
  | {
      name: string;
      owner: string;
      repo: string;
    };
```

### Repository Types

```typescript
interface Repository {
  owner: string;
  repo: string;
}

interface RepositoryIdentifier {
  full: string; // "owner/repo"
  owner: string;
  name: string;
}

type RepositoryAccess = 'read' | 'write' | 'admin';
```

### Command Types

```typescript
interface Command {
  name: string;
  description: string;
  execute(args: string[]): Promise<void>;
  buildOptions(program: CommandProgram): void;
}

interface CommandOption {
  flags: string;
  description: string;
  defaultValue?: any;
  required?: boolean;
}

interface CommandProgram {
  command(name: string): CommandProgram;
  description(text: string): CommandProgram;
  option(flags: string, description: string): CommandProgram;
  action(fn: (...args: any[]) => void): CommandProgram;
}
```

## Configuration Types

### Config Structure

```typescript
interface Config {
  token?: string;
  defaultRepo?: string;
  outputFormat?: OutputFormat;
  colorFormat?: ColorFormat;
  templatesDir?: string;
  confirmActions?: boolean;
}

type OutputFormat = 'json' | 'table';
type ColorFormat = 'hex' | 'rgb';

interface RuntimeConfig extends Config {
  readonly isRuntime: true;
  overrides: Partial<Config>;
}
```

### Configuration Options

```typescript
interface ConfigOptions {
  configPath?: string;
  autoCreate?: boolean;
  defaultValues?: Partial<Config>;
}

interface ConfigValidation {
  isValid: boolean;
  errors?: ValidationError[];
}

interface ValidationError {
  path: string[];
  message: string;
}
```

## Template Types

### Template Structure

```typescript
interface Template {
  name: string;
  description?: string;
  labels: Label[];
  metadata?: TemplateMetadata;
}

interface TemplateMetadata {
  version: string;
  author?: string;
  created: string;
  updated?: string;
}

interface TemplateOptions {
  force?: boolean;
  dryRun?: boolean;
  includeDescription?: boolean;
}
```

## GitHub API Types

### API Responses

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  hasNextPage: boolean;
  nextPage: number;
  totalCount?: number;
}

interface ErrorResponse {
  message: string;
  documentation_url?: string;
}
```

### API Options

```typescript
interface ApiOptions {
  baseUrl?: string;
  userAgent?: string;
  timeout?: number;
  retries?: number;
}

interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
```

## Utility Types

### Common Utilities

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type Nullable<T> = T | null;

type AsyncResult<T> = Promise<Result<T, Error>>;

interface Result<T, E> {
  ok: boolean;
  value?: T;
  error?: E;
}
```

### Function Types

```typescript
type AsyncFunction<T = void> = () => Promise<T>;

type ErrorHandler = (error: Error) => void | Promise<void>;

type ValidationFunction<T> = (value: T) => boolean | Promise<boolean>;

type TransformFunction<T, U> = (value: T) => U | Promise<U>;
```

## Event Types

### Event System

```typescript
interface EventEmitter {
  on(event: string, listener: EventListener): void;
  off(event: string, listener: EventListener): void;
  emit(event: string, ...args: any[]): void;
}

type EventListener = (...args: any[]) => void;

interface ConfigEvents {
  change: (key: string, value: any) => void;
  error: (error: Error) => void;
  ready: () => void;
}
```

## Type Guards

### Type Checking

```typescript
function isLabel(value: any): value is Label {
  return (
    typeof value === 'object' && typeof value.name === 'string' && typeof value.color === 'string'
  );
}

function isTemplate(value: any): value is Template {
  return typeof value === 'object' && typeof value.name === 'string' && Array.isArray(value.labels);
}

function isRepository(value: any): value is Repository {
  return (
    typeof value === 'object' && typeof value.owner === 'string' && typeof value.repo === 'string'
  );
}
```

## Using Types

### Type Safety Examples

```typescript
// Function parameter typing
function createLabel(label: LabelCreate): Promise<Label>;

// Array typing
const labels: Label[] = [];

// Generic constraints
function validateInput<T extends Label>(input: T): boolean;

// Union types
type ConfigValue = string | number | boolean | null;

// Mapped types
type ReadonlyConfig = Readonly<Config>;
```
