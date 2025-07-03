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

  describe('suggestLabels', () => {
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
});
