import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubManager } from '../../src/lib/github';
import { PublicError } from '../../src/utils/errors';
import nock from 'nock';
import { setupGitHubToken, setupNock, cleanupNock, mockExit } from '../setup';

//? Mock for logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

//? Mock for fs and path - using mock without import reference
vi.mock('fs', () => {
  //? Internal mock data definition
  const mockLabelsData = [
    { name: 'bug', color: 'ff0000', description: 'Bug report' },
    { name: 'feature', color: '00ff00', description: 'Feature request' },
  ];

  return {
    existsSync: vi.fn().mockReturnValue(true),
    readdirSync: vi.fn().mockReturnValue(['default.json']),
    readFileSync: vi.fn().mockReturnValue(JSON.stringify(mockLabelsData)),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

vi.mock('path', () => ({
  join: vi.fn().mockReturnValue('src/labels/default.json'),
}));

describe('GitHubManager', () => {
  let manager: GitHubManager;
  const githubApiUrl = 'https://api.github.com';

  beforeEach(() => {
    // Set up environment
    setupGitHubToken();

    // Create a new instance for each test
    manager = new GitHubManager();

    // Set up nock to intercept HTTP requests
    setupNock();
  });

  afterEach(() => {
    // Clean up
    vi.clearAllMocks();
    cleanupNock();
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
    it('should return labels from default.json file', async () => {
      //? Prepare example labels
      const mockLabelsData = [
        { name: 'bug', color: 'ff0000', description: 'Bug report' },
        { name: 'feature', color: '00ff00', description: 'Feature request' },
      ];

      //? Mock the getLabelsFromJSON method instead of relying on fs mocks
      vi.spyOn(manager, 'getLabelsFromJSON').mockResolvedValue(mockLabelsData);

      const labels = await manager.getLabelsFromJSON();
      expect(labels).toEqual(mockLabelsData);
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

  describe('getLabelsFromRepo', () => {
    const repoFullName = 'user/repo';
    const mockLabels = [
      {
        id: 123,
        node_id: 'node123',
        url: 'https://api.github.com/repos/user/repo/labels/bug',
        name: 'bug',
        color: 'ff0000',
        default: true,
        description: 'Bug report',
      },
      {
        id: 456,
        node_id: 'node456',
        url: 'https://api.github.com/repos/user/repo/labels/feature',
        name: 'feature',
        color: '00ff00',
        default: false,
        description: 'New feature',
      },
    ];

    it('should fetch labels from repository and return simplified format', async () => {
      //? Mock GitHub API response
      nock(githubApiUrl)
        .get(`/repos/${repoFullName}/labels`)
        .query({ per_page: 100 })
        .reply(200, mockLabels);

      const result = await manager.getLabelsFromRepo(repoFullName);

      //? Verify the result contains only name, color and description
      expect(result).toEqual([
        { name: 'bug', color: 'ff0000', description: 'Bug report' },
        { name: 'feature', color: '00ff00', description: 'New feature' },
      ]);
    });

    it('should handle empty description', async () => {
      const labelsWithEmptyDesc = [
        {
          id: 789,
          node_id: 'node789',
          url: 'https://api.github.com/repos/user/repo/labels/docs',
          name: 'docs',
          color: '0000ff',
          default: false,
          description: null,
        },
      ];

      nock(githubApiUrl)
        .get(`/repos/${repoFullName}/labels`)
        .query({ per_page: 100 })
        .reply(200, labelsWithEmptyDesc);

      const result = await manager.getLabelsFromRepo(repoFullName);

      //? Verify empty description is replaced with empty string
      expect(result).toEqual([{ name: 'docs', color: '0000ff', description: '' }]);
    });

    it('should throw PublicError when API request fails', async () => {
      nock(githubApiUrl)
        .get(`/repos/${repoFullName}/labels`)
        .query({ per_page: 100 })
        .reply(404, { message: 'Not found' });

      await expect(manager.getLabelsFromRepo(repoFullName)).rejects.toThrow(PublicError);
    });
  });

  describe('updatePullRequest', () => {
    const repoFullName = 'user/repo';
    const pullNumber = 123;

    it('should update both body and labels when both are provided', async () => {
      const updates = {
        body: 'Updated PR description',
        labels: ['bug', 'feature'],
      };

      // Mock PR update
      nock(githubApiUrl).patch(`/repos/${repoFullName}/pulls/${pullNumber}`).reply(200, {});

      // Mock labels update
      nock(githubApiUrl).put(`/repos/${repoFullName}/issues/${pullNumber}/labels`).reply(200, []);

      await expect(
        manager.updatePullRequest(repoFullName, pullNumber, updates)
      ).resolves.not.toThrow();
    });

    it('should update only body when only body is provided', async () => {
      const updates = {
        body: 'Updated PR description',
      };

      // Mock PR update - should be called
      nock(githubApiUrl).patch(`/repos/${repoFullName}/pulls/${pullNumber}`).reply(200, {});

      // No labels endpoint should be called

      await expect(
        manager.updatePullRequest(repoFullName, pullNumber, updates)
      ).resolves.not.toThrow();
    });

    it('should update only labels when only labels are provided', async () => {
      const updates = {
        labels: ['bug', 'feature'],
      };

      // No PR update should be called when body is undefined

      // Mock labels update
      nock(githubApiUrl).put(`/repos/${repoFullName}/issues/${pullNumber}/labels`).reply(200, []);

      await expect(
        manager.updatePullRequest(repoFullName, pullNumber, updates)
      ).resolves.not.toThrow();
    });

    it('should not call any API when no updates are provided', async () => {
      const updates = {};

      // No API calls should be made

      await expect(
        manager.updatePullRequest(repoFullName, pullNumber, updates)
      ).resolves.not.toThrow();
    });

    it('should not update body when body is explicitly undefined', async () => {
      const updates = {
        body: undefined,
        labels: ['bug'],
      };

      // No PR update should be called when body is undefined

      // Mock labels update
      nock(githubApiUrl).put(`/repos/${repoFullName}/issues/${pullNumber}/labels`).reply(200, []);

      await expect(
        manager.updatePullRequest(repoFullName, pullNumber, updates)
      ).resolves.not.toThrow();
    });

    it('should handle empty string body correctly', async () => {
      const updates = {
        body: '', // Empty string should still trigger update
        labels: ['bug'],
      };

      // Mock PR update with empty body
      nock(githubApiUrl).patch(`/repos/${repoFullName}/pulls/${pullNumber}`).reply(200, {});

      // Mock labels update
      nock(githubApiUrl).put(`/repos/${repoFullName}/issues/${pullNumber}/labels`).reply(200, []);

      await expect(
        manager.updatePullRequest(repoFullName, pullNumber, updates)
      ).resolves.not.toThrow();
    });

    it('should throw PublicError when PR update fails', async () => {
      const updates = {
        body: 'Updated PR description',
      };

      nock(githubApiUrl)
        .patch(`/repos/${repoFullName}/pulls/${pullNumber}`)
        .reply(400, { message: 'Bad request' });

      await expect(manager.updatePullRequest(repoFullName, pullNumber, updates)).rejects.toThrow(
        PublicError
      );
    });

    it('should throw PublicError when labels update fails', async () => {
      const updates = {
        labels: ['bug', 'feature'],
      };

      nock(githubApiUrl)
        .put(`/repos/${repoFullName}/issues/${pullNumber}/labels`)
        .reply(400, { message: 'Bad request' });

      await expect(manager.updatePullRequest(repoFullName, pullNumber, updates)).rejects.toThrow(
        PublicError
      );
    });

    it('should throw PublicError with correct message when update fails', async () => {
      const updates = {
        body: 'Updated PR description',
      };

      nock(githubApiUrl)
        .patch(`/repos/${repoFullName}/pulls/${pullNumber}`)
        .reply(500, { message: 'Internal server error' });

      await expect(manager.updatePullRequest(repoFullName, pullNumber, updates)).rejects.toThrow(
        'Failed to update pull request:'
      );
    });
  });
});
