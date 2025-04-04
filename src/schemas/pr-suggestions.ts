import { z } from 'zod';

export const labelSuggestionSchema = z.object({
  name: z.string().describe('The name of the suggested label'),
  description: z.string().describe('Description of why this label is appropriate for the PR'),
  confidence: z.number().describe('Confidence score between 1-100'),
  isNew: z
    .boolean()
    .describe('Whether this is a new label (true) or exists in the repository (false)'),
});

export const descriptionSchema = z.object({
  content: z.string().describe('Suggested description for the pull request'),
  confidence: z.number().describe('Confidence score between 1-100 for the suggested description'),
});

export const prSuggestionSchema = z.object({
  labels: z
    .array(labelSuggestionSchema)
    .describe('Array of label suggestions for the pull request'),
  description: z
    .object({
      en: descriptionSchema.describe('English version of the description'),
      pl: descriptionSchema.describe('Polish version of the description'),
    })
    .describe('Multilingual descriptions for the pull request'),
});
