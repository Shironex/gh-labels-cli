import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubManager } from '../../src/lib/github';
import {
  PublicError,
  AuthenticationError,
  NoRepositoriesFoundError,
  NoLabelsSelectedError,
  LabelExistsError,
  LabelNotFoundError,
  GitHubApiError,
  NoLabelsFoundError,
} from '../../src/utils/errors';
import nock from 'nock';
import labelsData from '../../src/json/labels.json';
import { setupGitHubToken, setupNock, cleanupNock, mockExit } from '../setup';

// Mock dla loggera
vi.mock('../../src/utils/logger', () => ({
  logger: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    isVerbose: vi.fn().mockReturnValue(false),
  },
}));

describe('GitHubManager', () => {
  let manager: GitHubManager;
  const mockToken = 'mock-token';
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

    it('should throw AuthenticationError if no token is provided', () => {
      //? Remove token from environment
      const originalToken = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      expect(() => new GitHubManager()).toThrow(AuthenticationError);
      expect(() => new GitHubManager()).toThrow(
        'Authentication failed. Please check your GitHub token.'
      );

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

    it('should throw NoRepositoriesFoundError if no repositories found', async () => {
      //? Mock API response with empty array
      nock(githubApiUrl).get('/user/repos').reply(200, []).persist();

      await expect(manager.selectRepository()).rejects.toThrow(NoRepositoriesFoundError);
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

    it('should throw NoLabelsSelectedError if no labels selected', async () => {
      //? Mock inquirer response with empty array
      const inquirer = await import('inquirer');
      (inquirer.default.prompt as any) = vi.fn().mockResolvedValue({
        selectedLabels: [],
      });

      await expect(manager.selectLabels()).rejects.toThrow(NoLabelsSelectedError);
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

    it('should throw LabelExistsError when label already exists', async () => {
      const mockSelectedLabels = [{ name: 'bug', color: 'ff0000', description: 'Bug report' }];

      //? Mock selectLabels method
      vi.spyOn(manager, 'selectLabels').mockResolvedValue(mockSelectedLabels);

      //? Mock GitHub API for creating label with 422 error
      nock(githubApiUrl)
        .post('/repos/user/repo/labels', {
          name: 'bug',
          color: 'ff0000',
          description: 'Bug report',
        })
        .times(2)
        .reply(422, { message: 'Validation Failed' });

      await expect(manager.addLabels('user/repo')).rejects.toThrow(LabelExistsError);
      await expect(manager.addLabels('user/repo')).rejects.toThrow('Label "bug" already exists.');
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
      // Mock GitHub API response
      nock(githubApiUrl)
        .get(`/repos/${repoFullName}/labels`)
        .query({ per_page: 100 })
        .reply(200, mockLabels);

      const result = await manager.getLabelsFromRepo(repoFullName);

      // Verify the result contains only name, color and description
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

      // Verify empty description is replaced with empty string
      expect(result).toEqual([{ name: 'docs', color: '0000ff', description: '' }]);
    });

    it('should throw GitHubApiError when API request fails', async () => {
      nock(githubApiUrl)
        .get(`/repos/${repoFullName}/labels`)
        .query({ per_page: 100 })
        .times(2)
        .reply(404, { message: 'Not found' });

      await expect(manager.getLabelsFromRepo(repoFullName)).rejects.toThrow(GitHubApiError);
      await expect(manager.getLabelsFromRepo(repoFullName)).rejects.toThrow(
        'GitHub API error (404): Not found'
      );
    });
  });

  describe('deleteLabels', () => {
    const repoFullName = 'user/repo';
    const mockLabels = [
      { name: 'bug', color: 'ff0000', description: 'Bug report' },
      { name: 'feature', color: '00ff00', description: 'New feature' },
    ];

    it('should delete selected labels from repository', async () => {
      // Mock getLabelsFromRepo response
      vi.spyOn(manager, 'getLabelsFromRepo').mockResolvedValue(mockLabels);

      // Mock inquirer response for label selection
      const inquirer = await import('inquirer');
      (inquirer.default.prompt as any) = vi.fn().mockResolvedValue({
        selectedLabels: ['bug', 'feature'],
      });

      // Mock GitHub API for deleting labels
      nock(githubApiUrl)
        .delete('/repos/user/repo/labels/bug')
        .reply(204)
        .delete('/repos/user/repo/labels/feature')
        .reply(204);

      await expect(manager.deleteLabels(repoFullName)).resolves.not.toThrow();

      // Verify that the logger.success was called for each deletion
      const logger = await import('../../src/utils/logger');
      expect(logger.logger.success).toHaveBeenCalledWith(expect.stringContaining('bug'));
      expect(logger.logger.success).toHaveBeenCalledWith(expect.stringContaining('feature'));
    });

    it('should throw LabelNotFoundError when label does not exist', async () => {
      // Mock getLabelsFromRepo response
      vi.spyOn(manager, 'getLabelsFromRepo').mockResolvedValue(mockLabels);

      // Mock inquirer response for label selection
      const inquirer = await import('inquirer');
      (inquirer.default.prompt as any) = vi.fn().mockResolvedValue({
        selectedLabels: ['non-existent'],
      });

      // Mock GitHub API for deleting labels with 404 error
      nock(githubApiUrl)
        .delete('/repos/user/repo/labels/non-existent')
        .times(2)
        .reply(404, { message: 'Not Found' });

      await expect(manager.deleteLabels(repoFullName)).rejects.toThrow(LabelNotFoundError);
      await expect(manager.deleteLabels(repoFullName)).rejects.toThrow(
        'Label "non-existent" not found.'
      );
    });

    it('should throw NoLabelsSelectedError when no labels are selected', async () => {
      // Mock getLabelsFromRepo response
      vi.spyOn(manager, 'getLabelsFromRepo').mockResolvedValue(mockLabels);

      // Mock inquirer response with empty selection
      const inquirer = await import('inquirer');
      (inquirer.default.prompt as any) = vi.fn().mockResolvedValue({
        selectedLabels: [],
      });

      await expect(manager.deleteLabels(repoFullName)).rejects.toThrow(NoLabelsSelectedError);
      await expect(manager.deleteLabels(repoFullName)).rejects.toThrow(
        'No labels were selected for deletion.'
      );
    });

    it('should throw NoLabelsFoundError when repository has no labels', async () => {
      // Mock getLabelsFromRepo response with empty array
      vi.spyOn(manager, 'getLabelsFromRepo').mockResolvedValue([]);

      await expect(manager.deleteLabels(repoFullName)).rejects.toThrow(NoLabelsFoundError);
      await expect(manager.deleteLabels(repoFullName)).rejects.toThrow(
        'No labels found in repository.'
      );
    });
  });
});
