import { describe, it, expect } from 'vitest';
import { PublicError } from '../../src/utils/errors';

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
