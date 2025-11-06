import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  suggestIssueLabelsAction,
  SuggestIssueLabelsOptions,
} from '../../src/commands/suggest-issue-labels';
import { PublicError } from '../../src/utils/errors';

// Mock all dependencies
vi.mock('../../src/lib/github', () => ({
  GitHubManager: vi.fn().mockImplementation(() => ({
    selectRepository: vi.fn().mockResolvedValue('user/repo'),
    getIssues: vi.fn().mockResolvedValue([
      { number: 10, title: 'Test Issue' },
      { number: 11, title: 'Another Issue' },
    ]),
    getIssueDetails: vi.fn().mockResolvedValue({
      title: 'Test Issue',
      description: 'Test issue description',
      repo: 'user/repo',
      state: 'open',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }),
    getLabelsFromRepo: vi
      .fn()
      .mockResolvedValue([{ name: 'bug', color: 'ff0000', description: 'Bug report' }]),
    updateIssue: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../../src/lib/openai', () => ({
  openAIService: {
    suggestIssueContent: vi.fn().mockResolvedValue({
      labels: [
        { name: 'bug', description: 'Bug report', confidence: 95, isNew: false },
        { name: 'critical', description: 'Critical issue', confidence: 85, isNew: true },
      ],
      description: {
        en: { content: 'English issue description', confidence: 90 },
        pl: { content: 'Polish issue description', confidence: 90 },
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

describe('suggestIssueLabelsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock responses for inquirer
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ selectedIssue: { number: 10, title: 'Test Issue' } })
      .mockResolvedValueOnce({ shouldApply: true })
      .mockResolvedValueOnce({ language: 'en' });
  });

  it('should apply both labels and description by default', async () => {
    await expect(suggestIssueLabelsAction('test-token')).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.selectRepository).toHaveBeenCalled();
    expect(managerInstance.getIssues).toHaveBeenCalled();
    expect(managerInstance.getIssueDetails).toHaveBeenCalled();
    expect(managerInstance.updateIssue).toHaveBeenCalledWith('user/repo', 10, {
      body: 'English issue description',
      labels: ['bug', 'critical'],
    });
    expect(openAIService.suggestIssueContent).toHaveBeenCalled();
  });

  it('should apply only labels when labelsOnly option is true', async () => {
    const options: SuggestIssueLabelsOptions = { labelsOnly: true };

    // Override mock to not ask for language since description won't be applied
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockReset()
      .mockResolvedValueOnce({ selectedIssue: { number: 10, title: 'Test Issue' } })
      .mockResolvedValueOnce({ shouldApply: true });

    await expect(suggestIssueLabelsAction('test-token', options)).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updateIssue).toHaveBeenCalledWith('user/repo', 10, {
      labels: ['bug', 'critical'],
    });
  });

  it('should apply only description when descriptionOnly option is true', async () => {
    const options: SuggestIssueLabelsOptions = { descriptionOnly: true };

    await expect(suggestIssueLabelsAction('test-token', options)).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updateIssue).toHaveBeenCalledWith('user/repo', 10, {
      body: 'English issue description',
    });
  });

  it('should skip labels when noLabels option is true', async () => {
    const options: SuggestIssueLabelsOptions = { noLabels: true };

    await expect(suggestIssueLabelsAction('test-token', options)).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updateIssue).toHaveBeenCalledWith('user/repo', 10, {
      body: 'English issue description',
    });
  });

  it('should skip description when noDescription option is true', async () => {
    const options: SuggestIssueLabelsOptions = { noDescription: true };

    // Override mock to not ask for language since description won't be applied
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockReset()
      .mockResolvedValueOnce({ selectedIssue: { number: 10, title: 'Test Issue' } })
      .mockResolvedValueOnce({ shouldApply: true });

    await expect(suggestIssueLabelsAction('test-token', options)).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updateIssue).toHaveBeenCalledWith('user/repo', 10, {
      labels: ['bug', 'critical'],
    });
  });

  it('should use Polish language when selected', async () => {
    // Override language selection to return 'pl'
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockReset()
      .mockResolvedValueOnce({ selectedIssue: { number: 10, title: 'Test Issue' } })
      .mockResolvedValueOnce({ shouldApply: true })
      .mockResolvedValueOnce({ language: 'pl' });

    await expect(suggestIssueLabelsAction('test-token')).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updateIssue).toHaveBeenCalledWith('user/repo', 10, {
      body: 'Polish issue description',
      labels: ['bug', 'critical'],
    });
  });

  it('should not apply changes when user declines', async () => {
    // User says no to applying changes
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockReset()
      .mockResolvedValueOnce({ selectedIssue: { number: 10, title: 'Test Issue' } })
      .mockResolvedValueOnce({ shouldApply: false });

    await expect(suggestIssueLabelsAction('test-token')).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updateIssue).not.toHaveBeenCalled();
  });

  it('should throw PublicError when all options are disabled', async () => {
    const options: SuggestIssueLabelsOptions = { noLabels: true, noDescription: true };

    await expect(suggestIssueLabelsAction('test-token', options)).rejects.toThrow(PublicError);
    await expect(suggestIssueLabelsAction('test-token', options)).rejects.toThrow(
      'At least one feature must be enabled. Cannot disable all options.'
    );
  });

  it('should apply both when conflicting options are provided', async () => {
    // When both labelsOnly and descriptionOnly are true, both should be applied
    const options: SuggestIssueLabelsOptions = { labelsOnly: true, descriptionOnly: true };

    await expect(suggestIssueLabelsAction('test-token', options)).resolves.not.toThrow();

    const managerInstance = (GitHubManager as unknown as ReturnType<typeof vi.fn>).mock.results[0]
      .value;
    expect(managerInstance.updateIssue).toHaveBeenCalledWith('user/repo', 10, {
      body: 'English issue description',
      labels: ['bug', 'critical'],
    });
  });

  it('should handle errors from GitHubManager', async () => {
    const mockError = new Error('GitHub API error');
    (GitHubManager as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      selectRepository: vi.fn().mockRejectedValue(mockError),
    }));

    await expect(suggestIssueLabelsAction('test-token')).rejects.toThrow(PublicError);
  });

  it('should handle errors from OpenAI service', async () => {
    const mockError = new Error('OpenAI API error');
    (
      openAIService.suggestIssueContent as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(mockError);

    await expect(suggestIssueLabelsAction('test-token')).rejects.toThrow(PublicError);
  });

  it('should handle empty issues list', async () => {
    // Reset the constructor mock for this specific test
    vi.clearAllMocks();
    (GitHubManager as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      selectRepository: vi.fn().mockResolvedValue('user/repo'),
      getIssues: vi.fn().mockResolvedValue([]),
      getIssueDetails: vi.fn(),
      getLabelsFromRepo: vi.fn(),
      updateIssue: vi.fn(),
      octokit: {},
    }));

    await expect(suggestIssueLabelsAction('test-token')).rejects.toThrow(PublicError);
  });
});
