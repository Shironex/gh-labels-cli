import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../src/utils/logger';
import chalk from 'chalk';

describe('logger', () => {
  beforeEach(() => {
    //? Mock console methods before each test
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    //? Restore mocks after each test
    vi.restoreAllMocks();
  });

  it('should have all required methods', () => {
    expect(logger.success).toBeTypeOf('function');
    expect(logger.error).toBeTypeOf('function');
    expect(logger.warning).toBeTypeOf('function');
    expect(logger.info).toBeTypeOf('function');
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
});
