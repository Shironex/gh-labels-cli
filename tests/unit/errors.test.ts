import { describe, it, expect } from 'vitest';
import { PublicError, OpenAIError, RateLimitError } from '../../src/utils/errors';

describe('PublicError', () => {
  it('should create an instance with the correct name and message', () => {
    const errorMessage = 'Test error message';
    const error = new PublicError(errorMessage);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PublicError);
    expect(error.name).toBe('PublicError');
    expect(error.message).toBe(errorMessage);
  });

  it('should be catchable as an Error', () => {
    const errorMessage = 'Test error message';

    try {
      throw new PublicError(errorMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PublicError);
      expect((error as PublicError).message).toBe(errorMessage);
    }
  });
});

describe('OpenAIError', () => {
  it('should create an instance with the correct name and message', () => {
    const errorMessage = 'Test error message';
    const error = new OpenAIError(errorMessage);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PublicError);
    expect(error).toBeInstanceOf(OpenAIError);
    expect(error.name).toBe('OpenAIError');
    expect(error.message).toBe(errorMessage);
  });

  it('should be catchable as Error and PublicError', () => {
    const errorMessage = 'Test error message';

    try {
      throw new OpenAIError(errorMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PublicError);
      expect(error).toBeInstanceOf(OpenAIError);
      expect((error as OpenAIError).message).toBe(errorMessage);
    }
  });
});

describe('RateLimitError', () => {
  it('should create an instance with the correct name and message', () => {
    const errorMessage = 'Test error message';
    const error = new RateLimitError(errorMessage);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PublicError);
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.name).toBe('RateLimitError');
    expect(error.message).toBe(errorMessage);
  });

  it('should be catchable as Error and PublicError', () => {
    const errorMessage = 'Test error message';

    try {
      throw new RateLimitError(errorMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PublicError);
      expect(error).toBeInstanceOf(RateLimitError);
      expect((error as RateLimitError).message).toBe(errorMessage);
    }
  });
});

describe('Error handling - interactions', () => {
  it('should correctly recognize OpenAIError in catch blocks', () => {
    try {
      throw new OpenAIError('OpenAI error occurred');
    } catch (error) {
      if (error instanceof OpenAIError) {
        expect(error.name).toBe('OpenAIError');
      } else {
        // This test should fail if error is not an OpenAIError
        expect(false).toBe(true);
      }
    }
  });

  it('should correctly recognize RateLimitError in catch blocks', () => {
    try {
      throw new RateLimitError('Rate limit exceeded');
    } catch (error) {
      if (error instanceof RateLimitError) {
        expect(error.name).toBe('RateLimitError');
      } else {
        // This test should fail if error is not a RateLimitError
        expect(false).toBe(true);
      }
    }
  });

  it('should distinguish between RateLimitError and OpenAIError', () => {
    const rateLimitError = new RateLimitError('Rate limit');
    const openAIError = new OpenAIError('OpenAI error');

    expect(rateLimitError instanceof RateLimitError).toBe(true);
    expect(openAIError instanceof OpenAIError).toBe(true);

    expect(rateLimitError instanceof OpenAIError).toBe(false);
    expect(openAIError instanceof RateLimitError).toBe(false);
  });
});
