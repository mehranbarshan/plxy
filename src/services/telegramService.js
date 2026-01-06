
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChannelCategorySchema = z.enum([
    'signals', 
    'news', 
    'insight', 
    'airdrop', 
    'other'
]);

const classifyChannelPrompt = ai.definePrompt({
    name: 'classifyChannelPrompt',
    input: {
        schema: z.object({
            name: z.string(),
            description: z.string(),
            message_sample: z.string(),
        })
    },
    output: {
        schema: z.object({
            category: ChannelCategorySchema,
        })
    },
    prompt: `Based on the channel name, description, and a sample of its recent messages, classify this Telegram channel into one of the following categories:
    - signals: Provides direct buy/sell trading signals.
    - news: Focuses on crypto news, articles, and updates.
    - insight: Provides market analysis, whale alerts, or deep-dive research without direct signals.
    - airdrop: Focuses on airdrop announcements and how-to guides.
    - other: If it doesn't fit any of the above categories.
    
    Channel Name: {{{name}}}
    Description: {{{description}}}
    Message Sample: {{{message_sample}}}
    
    Your response must only contain the JSON object with the category.`,
});

export async function preClassifyChannel(name, description, message_sample) {
    try {
        const { output } = await classifyChannelPrompt({ name, description, message_sample });
        return output?.category || 'other';
    } catch (error) {
        console.error("AI classification failed:", error);
        // Fallback to basic keyword matching if AI fails
        const content = `${name.toLowerCase()} ${description.toLowerCase()}`;
        if (/\b(signal|trade|tread|tرید|سیگنال)\b/i.test(content)) return 'signals';
        if (/\b(news|اخبار)\b/i.test(content)) return 'news';
        if (/\b(whale|alert|insight|تحلیل)\b/i.test(content)) return 'insight';
        if (/\b(airdrop|ایردراپ)\b/i.test(content)) return 'airdrop';
        return 'other';
    }
}
