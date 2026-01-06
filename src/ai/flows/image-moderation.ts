'use server';
/**
 * @fileOverview An AI-powered image moderation service.
 *
 * - moderateImage - A function that analyzes an image for inappropriate content.
 * - ImageModerationInput - The input type for the moderateImage function.
 * - ImageModerationOutput - The return type for the moderateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageModerationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be moderated, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageModerationInput = z.infer<typeof ImageModerationInputSchema>;

const ImageModerationOutputSchema = z.object({
  isSafe: z
    .boolean()
    .describe('Whether or not the image is safe for a profile picture.'),
  reason: z
    .string()
    .optional()
    .describe(
      'The reason why the image is not safe. Provided only if isSafe is false.'
    ),
});
export type ImageModerationOutput = z.infer<
  typeof ImageModerationOutputSchema
>;

export async function moderateImage(
  input: ImageModerationInput
): Promise<ImageModerationOutput> {
  return imageModerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageModerationPrompt',
  input: {schema: ImageModerationInputSchema},
  output: {schema: ImageModerationOutputSchema},
  prompt: `You are an AI image moderator. Your only task is to determine if an image contains nudity or sexually explicit content.

You must reject images if any private parts are visible.
If the image is safe, set isSafe to true.
If it is not safe, set isSafe to false and provide a brief, clear reason for the rejection.

Image: {{media url=photoDataUri}}`,
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
    ],
  }
});

const imageModerationFlow = ai.defineFlow(
  {
    name: 'imageModerationFlow',
    inputSchema: ImageModerationInputSchema,
    outputSchema: ImageModerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
