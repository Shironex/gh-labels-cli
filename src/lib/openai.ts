import OpenAI from 'openai';
import { PublicError, OpenAIError, RateLimitError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { PullRequestDetails, GithubLabel } from '@/types';

/**
 * Interface for the label suggestion response
 */
export interface LabelSuggestion {
  name: string;
  description: string | null;
  confidence: number; // 0-100
  isNew: boolean; // if true, this label doesn't exist in the repository
}

/**
 * Interface for the PR suggestion response
 */
export interface PRSuggestion {
  labels: LabelSuggestion[];
  description: {
    en: {
      content: string;
      confidence: number;
    };
    pl: {
      content: string;
      confidence: number;
    };
  };
}

/**
 * OpenAI service for label suggestions
 */
export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    } else {
      logger.warning(
        'No OpenAI API key found. Please set the OPENAI_API_KEY environment variable.'
      );
    }
  }

  /**
   * Generates a summary of a pull request for AI analysis
   */
  private generatePRSummary(pr: PullRequestDetails): string {
    const fileChanges = pr.files
      .map(file => `- ${file.name} (${file.status}, +${file.additions}, -${file.deletions})`)
      .join('\n');

    return `
Pull Request Title: ${pr.title}
Repository: ${pr.repo}

Description:
${pr.description || 'No description provided'}

Files Changed:
${fileChanges}
`;
  }

  /**
   * Suggests labels and description for a pull request based on its content
   */
  async suggestPRContent(
    pullRequestDetails: PullRequestDetails,
    existingLabels: GithubLabel[],
    prTemplate?: string
  ): Promise<PRSuggestion> {
    if (!this.client) {
      throw new PublicError(
        'OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.'
      );
    }

    try {
      const prSummary = this.generatePRSummary(pullRequestDetails);
      const existingLabelInfo = existingLabels
        .map(label => `${label.name}: ${label.description || 'No description'}`)
        .join('\n');

      const prompt = this.getPRSuggestionPrompt(prSummary, existingLabelInfo, prTemplate);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
        seed: 42,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}') as {
        labels: Array<{
          name: string;
          description: string;
          confidence: number;
          isNew: boolean;
        }>;
        description: {
          en: {
            content: string;
            confidence: number;
          };
          pl: {
            content: string;
            confidence: number;
          };
        };
      };

      if (
        !result ||
        !result.labels ||
        !result.description ||
        !result.description.en ||
        !result.description.pl
      ) {
        throw new PublicError('Failed to get suggestions from OpenAI');
      }

      return {
        labels: result.labels.map(label => ({
          name: label.name,
          description: label.description,
          confidence: Math.min(Math.max(1, label.confidence), 100),
          isNew: label.isNew,
        })),
        description: {
          en: {
            content: result.description.en.content,
            confidence: Math.min(Math.max(1, result.description.en.confidence), 100),
          },
          pl: {
            content: result.description.pl.content,
            confidence: Math.min(Math.max(1, result.description.pl.confidence), 100),
          },
        },
      };
    } catch (error) {
      if (error instanceof PublicError) {
        throw error;
      }

      if (error instanceof Error && error.message.includes('rate limit')) {
        logger.error(`Rate limit exceeded: ${error.message}`);
        throw new RateLimitError(
          'Limit żądań do API OpenAI został przekroczony. Spróbuj ponownie później.'
        );
      }

      logger.error(
        `OpenAI API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw new OpenAIError(
        `Błąd usługi AI: ${error instanceof Error ? error.message : 'Nieznany błąd'}`
      );
    }
  }

  private getPRSuggestionPrompt(
    prSummary: string,
    existingLabels: string,
    prTemplate?: string
  ): string {
    const templateInstructions = prTemplate
      ? `\nThe repository uses the following pull request template:
${prTemplate}

Please ensure the generated description follows this template structure while maintaining a clear and concise format.`
      : '';

    return `
      You are a GitHub pull request assistant. Your task is to suggest appropriate labels and a description for a pull request based on its content.

      Here's information about the pull request:
      ${prSummary}

      These are the labels available in the repository:
      ${existingLabels}

      Based on the pull request content:
      1. Suggest the most relevant labels from the available ones or suggest new ones if needed
      2. Generate comprehensive descriptions in both English and Polish that follow the Conventional Commits specification and summarize the changes

      The descriptions should:
      - Start with a type (feat, fix, docs, style, refactor, perf, test, or chore)
      - Include a scope if applicable
      - Have a clear and concise description
      - List the main changes and their impact
      - Reference any related issues${templateInstructions}

      Format your response as a JSON object with:
      1. A 'labels' array containing label suggestions (name, description, confidence, isNew)
      2. A 'description' object with English and Polish versions, each containing content and confidence score

      Example:
      {
        "labels": [
          {
            "name": "feature",
            "description": "This PR adds a new feature",
            "confidence": 90,
            "isNew": false
          }
        ],
        "description": {
          "en": {
            "content": "feat(auth): implement OAuth2 authentication\\n\\nAdd OAuth2 authentication support with the following changes:\\n- Integrate OAuth2 provider\\n- Add user authentication flow\\n- Implement token refresh mechanism\\n\\nFixes #123",
            "confidence": 85
          },
          "pl": {
            "content": "feat(auth): implementacja uwierzytelniania OAuth2\\n\\nDodano obsługę uwierzytelniania OAuth2 z następującymi zmianami:\\n- Integracja z dostawcą OAuth2\\n- Dodanie przepływu uwierzytelniania użytkownika\\n- Implementacja mechanizmu odświeżania tokenów\\n\\nNaprawia #123",
            "confidence": 85
          }
        }
      }
    `;
  }
}

// Create and export a singleton instance
export const openAIService = new OpenAIService();
