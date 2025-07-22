import { describe, it, expect, vi, beforeEach } from 'vitest';
import { suggestLabelsAction, SuggestLabelsOptions } from '../../src/commands/suggest-labels';
import { PublicError } from '../../src/utils/errors';

// Mock all dependencies
vi.mock('../../src/lib/github', () => ({
  GitHubManager: vi.fn().mockImplementation(() => ({
    selectRepository: vi.fn().mockResolvedValue('user/repo'),
    getPullRequests: vi.fn().mockResolvedValue([
      { number: 1, title: 'Test PR' },
      { number: 2, title: 'Another PR' },
    ]),
    getPullRequestDetails: vi.fn().mockResolvedValue({
      title: 'Test PR',
      description: 'Test description',
      files: [{ name: 'test.ts', status: 'added', additions: 10, deletions: 0 }],
      repo: 'user/repo',
    }),
    getLabelsFromRepo: vi
      .fn()
      .mockResolvedValue([{ name: 'bug', color: 'ff0000', description: 'Bug report' }]),
    updatePullRequest: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../../src/lib/openai', () => ({
  openAIService: {
    suggestPRContent: vi.fn().mockResolvedValue({
      labels: [
        { name: 'feature', description: 'New feature', confidence: 90, isNew: false },
        { name: 'enhancement', description: 'Enhancement', confidence: 80, isNew: true },
      ],
      description: {
        en: { content: 'English description', confidence: 85 },
        pl: { content: 'Polish description', confidence: 85 },
      },
    }),
  },
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: '',
  })),
}));

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  logger: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Import after mocking
import { GitHubManager } from '../../src/lib/github';
import { openAIService } from '../../src/lib/openai';
import inquirer from 'inquirer';

describe('suggestLabelsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock responses for inquirer
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ selectedPR: { number: 1, title: 'Test PR' } })
      .mockResolvedValueOnce({ shouldApply: true })
      .mockResolvedValueOnce({ language: 'en' });
  });

  it('should apply both labels and description by default', async () => {
    await expect(suggestLabelsAction('test-token')).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.selectRepository).toHaveBeenCalled();
    expect(managerInstance.getPullRequests).toHaveBeenCalled();
    expect(managerInstance.getPullRequestDetails).toHaveBeenCalled();
    expect(managerInstance.updatePullRequest).toHaveBeenCalledWith('user/repo', 1, {
      body: 'English description',
      labels: ['feature', 'enhancement'],
    });
    expect(openAIService.suggestPRContent).toHaveBeenCalled();
  });

  it('should apply only labels when labelsOnly option is true', async () => {
    const options: SuggestLabelsOptions = { labelsOnly: true };

    // Override mock to not ask for language since description won't be applied
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockReset()
      .mockResolvedValueOnce({ selectedPR: { number: 1, title: 'Test PR' } })
      .mockResolvedValueOnce({ shouldApply: true });

    await expect(suggestLabelsAction('test-token', options)).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updatePullRequest).toHaveBeenCalledWith('user/repo', 1, {
      labels: ['feature', 'enhancement'],
    });
  });

  it('should apply only description when descriptionOnly option is true', async () => {
    const options: SuggestLabelsOptions = { descriptionOnly: true };

    await expect(suggestLabelsAction('test-token', options)).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updatePullRequest).toHaveBeenCalledWith('user/repo', 1, {
      body: 'English description',
    });
  });

  it('should skip labels when noLabels option is true', async () => {
    const options: SuggestLabelsOptions = { noLabels: true };

    await expect(suggestLabelsAction('test-token', options)).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updatePullRequest).toHaveBeenCalledWith('user/repo', 1, {
      body: 'English description',
    });
  });

  it('should skip description when noDescription option is true', async () => {
    const options: SuggestLabelsOptions = { noDescription: true };

    // Override mock to not ask for language since description won't be applied
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockReset()
      .mockResolvedValueOnce({ selectedPR: { number: 1, title: 'Test PR' } })
      .mockResolvedValueOnce({ shouldApply: true });

    await expect(suggestLabelsAction('test-token', options)).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updatePullRequest).toHaveBeenCalledWith('user/repo', 1, {
      labels: ['feature', 'enhancement'],
    });
  });

  it('should use Polish language when selected', async () => {
    // Override language selection to return 'pl'
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockReset()
      .mockResolvedValueOnce({ selectedPR: { number: 1, title: 'Test PR' } })
      .mockResolvedValueOnce({ shouldApply: true })
      .mockResolvedValueOnce({ language: 'pl' });

    await expect(suggestLabelsAction('test-token')).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updatePullRequest).toHaveBeenCalledWith('user/repo', 1, {
      body: 'Polish description',
      labels: ['feature', 'enhancement'],
    });
  });

  it('should not apply changes when user declines', async () => {
    // User says no to applying changes
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockReset()
      .mockResolvedValueOnce({ selectedPR: { number: 1, title: 'Test PR' } })
      .mockResolvedValueOnce({ shouldApply: false });

    await expect(suggestLabelsAction('test-token')).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updatePullRequest).not.toHaveBeenCalled();
  });

  it('should throw PublicError when all options are disabled', async () => {
    const options: SuggestLabelsOptions = { noLabels: true, noDescription: true };

    await expect(suggestLabelsAction('test-token', options)).rejects.toThrow(PublicError);
    await expect(suggestLabelsAction('test-token', options)).rejects.toThrow(
      'At least one feature must be enabled. Cannot disable all options.'
    );
  });

  it('should apply both when conflicting options are provided', async () => {
    // When both labelsOnly and descriptionOnly are true, both should be applied
    const options: SuggestLabelsOptions = { labelsOnly: true, descriptionOnly: true };

    await expect(suggestLabelsAction('test-token', options)).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updatePullRequest).toHaveBeenCalledWith('user/repo', 1, {
      body: 'English description',
      labels: ['feature', 'enhancement'],
    });
  });

  it('should handle errors from GitHubManager', async () => {
    const mockError = new Error('GitHub API error');
    (GitHubManager as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      selectRepository: vi.fn().mockRejectedValue(mockError),
    }));

    await expect(suggestLabelsAction('test-token')).rejects.toThrow(PublicError);
  });

  it('should handle errors from OpenAI service', async () => {
    const mockError = new Error('OpenAI API error');
    (openAIService.suggestPRContent as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      mockError
    );

    await expect(suggestLabelsAction('test-token')).rejects.toThrow(PublicError);
  });
});
