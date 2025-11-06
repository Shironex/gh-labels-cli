import { PublicError, OpenAIError, RateLimitError } from './errors';
import { logger } from './logger';

/**
 * Centralized error handler for command-level error handling
 * Handles different error types and logs appropriate messages
 *
 * @param error - The error to handle
 * @param context - Context string to identify where the error occurred
 * @throws Always throws the error after logging
 */
export function handleCommandError(error: unknown, context: string): never {
  // Handle rate limit errors first (most specific)
  if (error instanceof RateLimitError) {
    logger.error('Rate limit exceeded. Please try again later.');
    throw error;
  }

  // Handle OpenAI-specific errors
  if (error instanceof OpenAIError) {
    logger.error(`AI service error: ${error.message}`);
    throw error;
  }

  // Handle all other public errors
  if (error instanceof PublicError) {
    logger.error(error.message);
    throw error;
  }

  // Handle network errors
  if (error instanceof Error && error.message.toLowerCase().includes('network')) {
    const errorMessage = 'Network error. Check your internet connection and try again.';
    logger.error(errorMessage);
    throw new PublicError(errorMessage);
  }

  // Handle all other unexpected errors
  const errorMessage = `Unexpected error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  logger.error(errorMessage);
  throw new PublicError(errorMessage);
}
