import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../src/utils/logger';
import chalk from 'chalk';

describe('logger', () => {
  const originalEnv = process.env;
  const mockDate = new Date('2024-01-01T12:00:00.000Z');

  beforeEach(() => {
    //? Mock console methods before each test
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    //? Reset environment variables before each test
    process.env = { ...originalEnv };
    //? Mock Date.now for consistent timestamps in tests
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    //? Restore mocks after each test
    vi.restoreAllMocks();
    //? Restore original environment
    process.env = originalEnv;
    //? Restore real timers
    vi.useRealTimers();
  });

  it('should have all required methods', () => {
    expect(logger.success).toBeTypeOf('function');
    expect(logger.error).toBeTypeOf('function');
    expect(logger.warning).toBeTypeOf('function');
    expect(logger.info).toBeTypeOf('function');
    expect(logger.debug).toBeTypeOf('function');
    expect(logger.isVerbose).toBeTypeOf('function');
  });

  it('should log success messages with green color', () => {
    const message = 'Success message';
    logger.success(message);

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(chalk.green(`✅ ${message}`));
  });

  it('should log error messages with red color', () => {
    const message = 'Error message';
    logger.error(message);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(chalk.red(`❌ ${message}`));
  });

  it('should log warning messages with yellow color', () => {
    const message = 'Warning message';
    logger.warning(message);

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(chalk.yellow(`⚠️ ${message}`));
  });

  it('should log info messages with blue color', () => {
    const message = 'Info message';
    logger.info(message);

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(chalk.blue(`ℹ️ ${message}`));
  });

  describe('debug logging', () => {
    const expectedTimestamp = mockDate.toISOString();

    it('should not log debug messages when verbose mode is disabled', () => {
      const message = 'Debug message';
      logger.debug(message);

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should log debug messages with timestamp when DEBUG=true', () => {
      process.env.DEBUG = 'true';
      const message = 'Debug message';
      logger.debug(message);

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(chalk.gray(`🔍 [${expectedTimestamp}] ${message}`));
    });

    it('should log debug messages with timestamp when VERBOSE=true', () => {
      process.env.VERBOSE = 'true';
      const message = 'Debug message';
      logger.debug(message);

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(chalk.gray(`🔍 [${expectedTimestamp}] ${message}`));
    });

    it('should log debug messages with timestamp when NODE_ENV=development', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Debug message';
      logger.debug(message);

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(chalk.gray(`🔍 [${expectedTimestamp}] ${message}`));
    });
  });

  describe('isVerbose', () => {
    it('should return false when no verbose flags are set', () => {
      expect(logger.isVerbose()).toBe(false);
    });

    it('should return true when DEBUG=true', () => {
      process.env.DEBUG = 'true';
      expect(logger.isVerbose()).toBe(true);
    });

    it('should return true when VERBOSE=true', () => {
      process.env.VERBOSE = 'true';
      expect(logger.isVerbose()).toBe(true);
    });

    it('should return true when NODE_ENV=development', () => {
      process.env.NODE_ENV = 'development';
      expect(logger.isVerbose()).toBe(true);
    });

    it('should return false for invalid environment variable values', () => {
      process.env.DEBUG = 'yes';
      process.env.VERBOSE = '1';
      expect(logger.isVerbose()).toBe(false);
    });
  });
});
