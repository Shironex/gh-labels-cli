import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addLabelsAction } from '../../src/commands/add';
import { getLabelsAction } from '../../src/commands/get-labels';
import { helpAction } from '../../src/commands/help';
import { GitHubManager } from '../../src/lib/github';
import { PublicError } from '../../src/utils/errors';

// Mock dependencies
vi.mock('../../src/lib/github', () => ({
  GitHubManager: vi.fn().mockImplementation(() => ({
    selectRepository: vi.fn().mockResolvedValue('user/repo'),
    addLabels: vi.fn().mockResolvedValue(undefined),
    getLabelsFromRepo: vi
      .fn()
      .mockResolvedValue([{ name: 'bug', color: 'ff0000', description: 'Bug report' }]),
  })),
}));

vi.mock('../../src/utils/logger', () => ({
  logger: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock console.log
const originalConsoleLog = console.log;
const mockConsoleLog = vi.fn();

describe('Commands', () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    vi.clearAllMocks();
  });

  describe('addLabelsAction', () => {
    it('should select repository and add labels', async () => {
      await expect(addLabelsAction()).resolves.not.toThrow();

      const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
        .value;
      expect(managerInstance.selectRepository).toHaveBeenCalledTimes(1);
      expect(managerInstance.addLabels).toHaveBeenCalledWith('user/repo');
    });

    it('should throw PublicError when an error occurs', async () => {
      const mockError = new Error('Test error');
      (GitHubManager as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        selectRepository: vi.fn().mockRejectedValue(mockError),
      }));

      await expect(addLabelsAction()).rejects.toThrow(PublicError);
    });
  });

  describe('getLabelsAction', () => {
    it('should select repository and get labels', async () => {
      await expect(getLabelsAction()).resolves.not.toThrow();

      const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
        .value;
      expect(managerInstance.selectRepository).toHaveBeenCalledTimes(1);
      expect(managerInstance.getLabelsFromRepo).toHaveBeenCalledWith('user/repo');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.any(String));
    });

    it('should throw PublicError when an error occurs', async () => {
      const mockError = new Error('Test error');
      (GitHubManager as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        selectRepository: vi.fn().mockRejectedValue(mockError),
      }));

      await expect(getLabelsAction()).rejects.toThrow(PublicError);
    });
  });

  describe('helpAction', () => {
    it('should display available commands', () => {
      helpAction();

      expect(mockConsoleLog).toHaveBeenCalledTimes(5);
      expect(mockConsoleLog).toHaveBeenCalledWith('Available commands:');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('add'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('get-labels'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('help'));
    });
  });
});
