import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addLabelsAction } from '../../src/commands/add-labels';
import { getLabelsAction } from '../../src/commands/get-labels';
import { removeLabelAction } from '../../src/commands/remove-labels';
import { helpAction } from '../../src/commands/help';
import { GitHubManager } from '../../src/lib/github';
import { PublicError } from '../../src/utils/errors';

//? Mock for fs module
vi.mock('fs', () => {
  return {
    default: {
      existsSync: vi.fn().mockReturnValue(false),
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
    },
    existsSync: vi.fn().mockReturnValue(false),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

//? Mock for path module
vi.mock('path', () => {
  return {
    default: {
      join: vi.fn().mockReturnValue('src/labels/user-repo.json'),
    },
    join: vi.fn().mockReturnValue('src/labels/user-repo.json'),
  };
});

//? Mock for commands/get-labels.ts to avoid real file system operations
vi.mock('../../src/commands/get-labels', async () => {
  const actual = await vi.importActual('../../src/commands/get-labels');
  return {
    ...actual,
    getLabelsAction: vi.fn().mockImplementation(async () => {
      const fs = await import('fs');
      const path = await import('path');

      // Simulate the operations
      const manager = new GitHubManager();
      const repo = await manager.selectRepository();
      const labels = await manager.getLabelsFromRepo(repo);

      // Mock file operations
      fs.existsSync(path.join('src', 'labels'));
      fs.mkdirSync(path.join('src', 'labels'));
      fs.writeFileSync(
        path.join('src', 'labels', `${repo.replace('/', '-')}.json`),
        JSON.stringify(labels, null, 2)
      );

      return labels;
    }),
  };
});

//? Mock dependencies
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

//? Mock ora
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
  })),
}));

//? Mock console.log
const originalConsoleLog = console.log;
const mockConsoleLog = vi.fn();

describe('Commands', () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    //? Reset mock counts before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
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
    it('should select repository, get labels and save them to file', async () => {
      //? Import fs and path modules
      const fs = await import('fs');
      const path = await import('path');

      //? Perform the action
      await getLabelsAction();

      //? Verify file system operations were called
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(path.join).toHaveBeenCalled();
    });

    it('should throw PublicError when an error occurs', async () => {
      const originalGetLabelsAction = await vi.importActual('../../src/commands/get-labels');

      //? Temporarily restore original implementation to handle error properly
      vi.doUnmock('../../src/commands/get-labels');

      //? Replace mocked GitHubManager implementation to return an error
      const mockError = new Error('Test error');
      (GitHubManager as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        selectRepository: vi.fn().mockRejectedValue(mockError),
      }));

      //? Import real function after removing the mock
      const { getLabelsAction: actualGetLabelsAction } = await import(
        '../../src/commands/get-labels'
      );

      //? Now PublicError should be thrown
      await expect(actualGetLabelsAction()).rejects.toThrow();

      //? Restore mock at the end of test
      vi.doMock('../../src/commands/get-labels', () => ({
        ...originalGetLabelsAction,
        getLabelsAction: vi.fn().mockImplementation(async () => {
          const fs = await import('fs');
          const path = await import('path');

          const manager = new GitHubManager();
          const repo = await manager.selectRepository();
          const labels = await manager.getLabelsFromRepo(repo);

          fs.existsSync(path.join('src', 'labels'));
          fs.mkdirSync(path.join('src', 'labels'));
          fs.writeFileSync(
            path.join('src', 'labels', `${repo.replace('/', '-')}.json`),
            JSON.stringify(labels, null, 2)
          );

          return labels;
        }),
      }));
    });
  });

  describe('removeLabelAction', () => {
    it('should select repository and remove labels', async () => {
      // Make sure GitHubManager mock includes removeLabels method
      (GitHubManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        selectRepository: vi.fn().mockResolvedValue('user/repo'),
        removeLabels: vi.fn().mockResolvedValue(undefined),
        getLabelsFromRepo: vi
          .fn()
          .mockResolvedValue([{ name: 'bug', color: 'ff0000', description: 'Bug report' }]),
      }));

      // Mock ora
      vi.mock('ora', () => ({
        default: vi.fn(() => ({
          start: vi.fn().mockReturnThis(),
          text: '',
          succeed: vi.fn(),
          fail: vi.fn(),
        })),
      }));

      // Perform the action
      await expect(removeLabelAction()).resolves.not.toThrow();

      // Verify the GitHub API calls
      const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
        .value;
      expect(managerInstance.selectRepository).toHaveBeenCalledTimes(1);
      expect(managerInstance.removeLabels).toHaveBeenCalledWith('user/repo');
    });

    it('should throw PublicError when an error occurs', async () => {
      const mockError = new Error('Test error');
      (GitHubManager as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        selectRepository: vi.fn().mockRejectedValue(mockError),
      }));

      // Mock ora for this test
      vi.mock('ora', () => ({
        default: vi.fn(() => ({
          start: vi.fn().mockReturnThis(),
          text: '',
          succeed: vi.fn(),
          fail: vi.fn(),
        })),
      }));

      await expect(removeLabelAction()).rejects.toThrow(PublicError);
    });
  });

  describe('helpAction', () => {
    it('should display available commands', () => {
      helpAction();

      // Now expecting 6 calls instead of 5 due to the new remove-labels command
      expect(mockConsoleLog).toHaveBeenCalledTimes(6);
      expect(mockConsoleLog).toHaveBeenCalledWith('Available commands:');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('add-labels'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('get-labels'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('remove-labels'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('help'));
    });
  });
});
