// Base error class for all public errors
export class PublicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PublicError';
  }
}

// Authentication related errors
export class AuthenticationError extends PublicError {
  constructor(message: string = 'Authentication failed. Please check your GitHub token.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Repository related errors
export class RepositoryError extends PublicError {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class NoRepositoriesFoundError extends RepositoryError {
  constructor(message: string = 'No repositories found.') {
    super(message);
    this.name = 'NoRepositoriesFoundError';
  }
}

// Label related errors
export class LabelError extends PublicError {
  constructor(message: string) {
    super(message);
    this.name = 'LabelError';
  }
}

export class NoLabelsFoundError extends LabelError {
  constructor(message: string = 'No labels found in repository.') {
    super(message);
    this.name = 'NoLabelsFoundError';
  }
}

export class NoLabelsSelectedError extends LabelError {
  constructor(message: string = 'No labels were selected.') {
    super(message);
    this.name = 'NoLabelsSelectedError';
  }
}

export class LabelExistsError extends LabelError {
  constructor(labelName: string) {
    super(`Label "${labelName}" already exists.`);
    this.name = 'LabelExistsError';
  }
}

export class LabelNotFoundError extends LabelError {
  constructor(labelName: string) {
    super(`Label "${labelName}" not found.`);
    this.name = 'LabelNotFoundError';
  }
}

// API related errors
export class GitHubApiError extends PublicError {
  status: number;

  constructor(message: string, status: number) {
    super(`GitHub API error (${status}): ${message}`);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

// Rate limiting errors
export class RateLimitError extends GitHubApiError {
  constructor(message: string = 'GitHub API rate limit exceeded. Please try again later.') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

// Configuration errors
export class ConfigurationError extends PublicError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

// File system errors
export class FileSystemError extends PublicError {
  constructor(message: string) {
    super(message);
    this.name = 'FileSystemError';
  }
}

// JSON parsing errors
export class JsonParseError extends PublicError {
  constructor(message: string) {
    super(`Failed to parse JSON: ${message}`);
    this.name = 'JsonParseError';
  }
}
