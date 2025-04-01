import OpenAI from 'openai';
import { PublicError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { PullRequestDetails, GithubLabel } from '@/types';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

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
   * @param pr The pull request details
   * @returns A string summary of the pull request
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
   * Suggests labels for a pull request based on its content
   * @param pullRequestDetails Details of the pull request
   * @param existingLabels List of labels already in the repository
   * @returns Array of label suggestions
   */
  async suggestLabels(
    pullRequestDetails: PullRequestDetails,
    existingLabels: GithubLabel[]
  ): Promise<LabelSuggestion[]> {
    if (!this.client) {
      throw new PublicError(
        'OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.'
      );
    }

    try {
      const prSummary = this.generatePRSummary(pullRequestDetails);

      //? Extract existing label names and descriptions
      const existingLabelInfo = existingLabels
        .map(label => `${label.name}: ${label.description || 'No description'}`)
        .join('\n');

      // Create a Zod schema for label suggestions
      const labelSuggestionSchema = z.object({
        name: z.string().describe('The name of the suggested label'),
        description: z.string().describe('Description of why this label is appropriate for the PR'),
        confidence: z.number().describe('Confidence score between 1-100'),
        isNew: z
          .boolean()
          .describe('Whether this is a new label (true) or exists in the repository (false)'),
      });

      // Define the schema for multiple suggestions
      const suggestionsSchema = z.object({
        suggestions: z
          .array(labelSuggestionSchema)
          .describe('Array of label suggestions for the pull request'),
      });

      const prompt = `
You are a GitHub label assistant. Your task is to suggest appropriate labels for a pull request based on its content.

Here's information about the pull request:
${prSummary}

These are the labels available in the repository:
${existingLabelInfo}

Based on the pull request content, suggest the most relevant labels from the available ones. 
If the pull request content suggests a new label that doesn't exist yet, you can suggest it as well.

For each suggested label, provide:
1. The name of the label
2. A description explaining why this label is appropriate
3. A confidence score between 1-100 for how relevant this label is (must be a number, not a string)
4. Whether this is a new label (true) or an existing one (false)

Format your response as a JSON object with a 'suggestions' property containing an array of label suggestions.
Example:
{
  "suggestions": [
    {
      "name": "bug",
      "description": "This PR fixes a critical issue",
      "confidence": 95,
      "isNew": false
    },
    {
      "name": "enhancement",
      "description": "This PR adds a new feature",
      "confidence": 80,
      "isNew": false
    }
  ]
}
`;

      const completion = await this.client.beta.chat.completions.parse({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: zodResponseFormat(suggestionsSchema, 'labelSuggestions'),
      });

      // Get the parsed data which is already validated against our schema
      const result = completion.choices[0].message.parsed;

      if (!result || !result.suggestions) {
        throw new PublicError('Failed to get label suggestions from OpenAI');
      }

      // Validate and normalize the results
      return result.suggestions.map(suggestion => ({
        name: suggestion.name,
        description: suggestion.description,
        // Ensure confidence is within the valid range
        confidence: Math.min(Math.max(1, suggestion.confidence), 100),
        isNew: suggestion.isNew,
      }));
    } catch (error) {
      if (error instanceof PublicError) {
        throw error;
      }

      logger.error(
        `OpenAI API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw new PublicError(
        `Failed to get label suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Create and export a singleton instance
export const openAIService = new OpenAIService();
