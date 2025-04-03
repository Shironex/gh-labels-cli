export class PublicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PublicError';
  }
}

export class OpenAIError extends PublicError {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIError';
  }
}

export class RateLimitError extends PublicError {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
