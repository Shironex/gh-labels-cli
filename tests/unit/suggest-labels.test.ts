import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PublicError } from '../../src/utils/errors';
import { setupGitHubToken, setupNock, cleanupNock } from '../setup';

// Moki
vi.mock('../../src/utils/logger', () => ({
  logger: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../src/lib/github', () => ({
  GitHubManager: vi.fn().mockImplementation(() => ({
    selectRepository: vi.fn().mockResolvedValue('user/repo'),
    getPullRequests: vi.fn().mockResolvedValue([
      { number: 1, title: 'Test PR' },
      { number: 2, title: 'Another PR' },
    ]),
    getLabelsFromRepo: vi.fn().mockResolvedValue([]),
    getPullRequestDetails: vi.fn().mockResolvedValue({
      title: 'Test PR',
      description: 'Test description',
      repo: 'user/repo',
      files: [],
    }),
    addLabelsToPullRequest: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../../src/lib/openai', () => ({
  openAIService: {
    suggestLabels: vi.fn().mockResolvedValue([
      {
        name: 'bug',
        description: 'Test description',
        confidence: 90,
        isNew: false,
      },
    ]),
  },
}));

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({
      selectedPR: { number: 1, title: 'Test PR' },
      shouldApply: true,
    }),
  },
}));

vi.mock('ora', () => ({
  default: vi.fn().mockReturnValue({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    text: '',
  }),
}));

// Import testowanej funkcji
import { suggestLabelsAction } from '../../src/commands/suggest-labels';

describe('suggestLabelsAction', () => {
  beforeEach(() => {
    setupGitHubToken();
    setupNock();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanupNock();
  });

  // Basic test that checks if the function works correctly
  it('should successfully suggest and apply labels to a pull request', async () => {
    await expect(suggestLabelsAction('mock-token')).resolves.not.toThrow();
  });
});
