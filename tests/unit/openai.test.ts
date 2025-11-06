import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIService } from '../../src/lib/openai';
import { PublicError } from '../../src/utils/errors';

// Przygotowanie mocków
vi.mock('../../src/utils/logger', () => ({
  logger: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mocki OpenAI są dynamicznie tworzone wewnątrz testów

// Mock dla process.env
vi.mock('../../src/templates/prompts', () => ({
  getLabelSuggestionPrompt: vi.fn().mockReturnValue('mockPrompt'),
}));

describe('OpenAIService', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.OPENAI_API_KEY = 'mock-api-key';
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with the API key from environment', () => {
      const service = new OpenAIService();
      expect(service).toBeInstanceOf(OpenAIService);
    });
  });

  describe('suggestPRContent', () => {
    it('should throw PublicError when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;
      const service = new OpenAIService();

      const mockPullRequestDetails = {
        title: 'Test PR',
        description: 'Test description',
        repo: 'user/repo',
        files: [],
      };

      const mockExistingLabels = [{ name: 'bug', color: 'ff0000', description: 'Bug report' }];

      await expect(
        service.suggestPRContent(mockPullRequestDetails, mockExistingLabels)
      ).rejects.toThrow(PublicError);
    });
  });

  describe('suggestIssueContent', () => {
    it('should throw PublicError when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;
      const service = new OpenAIService();

      const mockIssueDetails = {
        title: 'Test Issue',
        description: 'Test issue description',
        repo: 'user/repo',
        state: 'open' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockExistingLabels = [{ name: 'bug', color: 'ff0000', description: 'Bug report' }];

      await expect(
        service.suggestIssueContent(mockIssueDetails, mockExistingLabels)
      ).rejects.toThrow(PublicError);
      await expect(
        service.suggestIssueContent(mockIssueDetails, mockExistingLabels)
      ).rejects.toThrow('OpenAI API key not found');
    });

    it('should throw PublicError when API key is missing with template', async () => {
      delete process.env.OPENAI_API_KEY;
      const service = new OpenAIService();

      const mockIssueDetails = {
        title: 'Bug Report',
        description: 'Application crashes on startup',
        repo: 'user/repo',
        state: 'open' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockExistingLabels = [
        { name: 'bug', color: 'ff0000', description: 'Bug report' },
        { name: 'critical', color: 'ff00ff', description: 'Critical issue' },
      ];

      const mockTemplate =
        '## Bug Report\n\n**Steps to Reproduce:**\n\n**Expected:**\n\n**Actual:**';

      await expect(
        service.suggestIssueContent(mockIssueDetails, mockExistingLabels, mockTemplate)
      ).rejects.toThrow(PublicError);
    });
  });
});
