import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubManager } from '../../src/lib/github';
import { PublicError } from '../../src/utils/errors';
import nock from 'nock';
import labelsData from '../../src/json/labels.json';

//? Mock modules
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
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

//? Mock process.exit
const mockExit = vi.spyOn(process, 'exit').mockImplementation(code => {
  throw new Error(`Process.exit called with code: ${code}`);
});

describe('GitHubManager', () => {
  let manager: GitHubManager;
  const mockToken = 'mock-token';
  const githubApiUrl = 'https://api.github.com';

  beforeEach(() => {
    // Set up environment
    process.env.GITHUB_TOKEN = mockToken;

    // Create a new instance for each test
    manager = new GitHubManager();

    // Set up nock to intercept HTTP requests
    nock.disableNetConnect();
  });

  afterEach(() => {
    // Clean up
    vi.clearAllMocks();
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe('constructor', () => {
    it('should create an instance with token from environment', () => {
      expect(manager).toBeInstanceOf(GitHubManager);
      expect(manager.octokit).toBeDefined();
    });

    it('should create an instance with provided token', () => {
      const customToken = 'custom-token';
      const customManager = new GitHubManager(customToken);
      expect(customManager).toBeInstanceOf(GitHubManager);
      expect(customManager.octokit).toBeDefined();
    });

    it('should exit if no token is provided', () => {
      //? Remove token from environment
      const originalToken = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      expect(() => new GitHubManager()).toThrow();
      expect(mockExit).toHaveBeenCalledWith(1);

      //? Restore token
      process.env.GITHUB_TOKEN = originalToken;
    });
  });

  describe('getLabelsFromJSON', () => {
    it('should return labels from JSON file', async () => {
      const labels = await manager.getLabelsFromJSON();
      expect(labels).toEqual(labelsData);
    });
  });

  describe('selectRepository', () => {
    it('should fetch and return selected repository', async () => {
      //? Mock API response
      const mockRepos = [{ full_name: 'user/repo1' }, { full_name: 'user/repo2' }];

      //? Mock Octokit response
      nock(githubApiUrl).get('/user/repos').reply(200, mockRepos);

      //? Mock inquirer response
      const inquirer = await import('inquirer');
      (inquirer.default.prompt as any) = vi.fn().mockResolvedValue({
        selectedRepo: 'user/repo1',
      });

      const result = await manager.selectRepository();
      expect(result).toBe('user/repo1');
      expect(inquirer.default.prompt).toHaveBeenCalled();
    });

    it('should throw error if no repositories found', async () => {
      //? Mock API response with empty array
      nock(githubApiUrl).get('/user/repos').reply(200, []).persist();

      await expect(manager.selectRepository()).rejects.toThrow(PublicError);
      await expect(manager.selectRepository()).rejects.toThrow('No repositories found.');
    });
  });

  describe('selectLabels', () => {
    it('should return selected labels', async () => {
      const mockSelectedLabels = [{ name: 'bug', color: 'ff0000', description: 'Bug report' }];

      //? Mock inquirer response
      const inquirer = await import('inquirer');
      (inquirer.default.prompt as any) = vi.fn().mockResolvedValue({
        selectedLabels: mockSelectedLabels,
      });

      const result = await manager.selectLabels();
      expect(result).toEqual(mockSelectedLabels);
      expect(inquirer.default.prompt).toHaveBeenCalled();
    });

    it('should throw error if no labels selected', async () => {
      //? Mock inquirer response with empty array
      const inquirer = await import('inquirer');
      (inquirer.default.prompt as any) = vi.fn().mockResolvedValue({
        selectedLabels: [],
      });

      await expect(manager.selectLabels()).rejects.toThrow(PublicError);
      await expect(manager.selectLabels()).rejects.toThrow('No labels were selected.');
    });
  });

  describe('addLabels', () => {
    it('should add labels to repository', async () => {
      const mockSelectedLabels = [{ name: 'bug', color: 'ff0000', description: 'Bug report' }];

      //? Mock selectLabels method
      vi.spyOn(manager, 'selectLabels').mockResolvedValue(mockSelectedLabels);

      //? Mock GitHub API for creating label
      nock(githubApiUrl)
        .post('/repos/user/repo/labels')
        .reply(201, { name: 'bug', color: 'ff0000', description: 'Bug report' });

      await expect(manager.addLabels('user/repo')).resolves.not.toThrow();

      //? Verify that the logger.success was called
      const logger = await import('../../src/utils/logger');
      expect(logger.logger.success).toHaveBeenCalledWith(
        expect.stringContaining('added successfully')
      );
    });

    it('should handle label already exists error', async () => {
      const mockSelectedLabels = [{ name: 'bug', color: 'ff0000', description: 'Bug report' }];

      //? Mock selectLabels method
      vi.spyOn(manager, 'selectLabels').mockResolvedValue(mockSelectedLabels);

      //? Mock GitHub API for creating label with 422 error
      nock(githubApiUrl)
        .post('/repos/user/repo/labels')
        .reply(422, { message: 'Validation Failed' });

      await expect(manager.addLabels('user/repo')).resolves.not.toThrow();

      //? Verify that the logger.warning was called
      const logger = await import('../../src/utils/logger');
      expect(logger.logger.warning).toHaveBeenCalledWith(expect.stringContaining('already exists'));
    });
  });
});
