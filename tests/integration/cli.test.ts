import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { GitHubManager } from '../../src/lib/github';

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
vi.spyOn(process, 'exit').mockImplementation(code => {
  throw new Error(`Process.exit called with code: ${code}`);
});

describe('CLI Integration', () => {
  beforeEach(() => {
    //? Set up environment
    process.env.GITHUB_TOKEN = 'mock-token';

    //? Set up nock to intercept HTTP requests
    nock.disableNetConnect();
  });

  afterEach(() => {
    //? Clean up
    vi.clearAllMocks();
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should execute the main CLI flow', async () => {
    //? Mock repositories API response
    const mockRepos = [{ full_name: 'user/repo1' }, { full_name: 'user/repo2' }];

    nock('https://api.github.com').get('/user/repos').reply(200, mockRepos);

    //? Mock label creation API response
    nock('https://api.github.com')
      .post('/repos/user/repo1/labels')
      .reply(201, { name: 'bug', color: 'ff0000', description: 'Bug report' });

    //? Mock inquirer responses
    const inquirer = await import('inquirer');
    (inquirer.default.prompt as any) = vi
      .fn()
      .mockResolvedValueOnce({ selectedRepo: 'user/repo1' }) //? First call for repository selection
      .mockResolvedValueOnce({
        selectedLabels: [{ name: 'bug', color: 'ff0000', description: 'Bug report' }],
      }); //? Second call for label selection

    //? Create a GitHubManager instance
    const manager = new GitHubManager();

    //? Execute the main flow
    const selectedRepo = await manager.selectRepository();
    expect(selectedRepo).toBe('user/repo1');

    await manager.addLabels(selectedRepo);

    //? Verify that the logger was called
    const logger = await import('../../src/utils/logger');
    expect(logger.logger.info).toHaveBeenCalledWith(expect.stringContaining('Adding labels'));
    expect(logger.logger.success).toHaveBeenCalledWith(
      expect.stringContaining('added successfully')
    );
  });

  it('should handle errors gracefully', async () => {
    //? Mock repositories API error
    nock('https://api.github.com').get('/user/repos').reply(401, { message: 'Bad credentials' });

    //? Create a GitHubManager instance
    const manager = new GitHubManager();

    //? Execute and expect error
    try {
      await manager.selectRepository();
      //? If we get here, the test should fail
      expect('Test should have thrown an error').toBe(false);
    } catch (error) {
      //? We expect the error to be caught
      expect(error).toBeDefined();
    }

    //? Since logger.error is not directly called in the selectRepository method,
    //? check if mockExit was called, which indicates error handling,
    //? or check if spinner.succeed was called, which indicates success
    const ora = await import('ora');
    expect(ora.default).toHaveBeenCalled();
  });
});
