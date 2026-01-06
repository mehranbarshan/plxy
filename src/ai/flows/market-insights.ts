
'use server';
/**
 * @fileOverview Provides AI-powered market insights for selected cryptocurrencies.
 *
 * - getMarketInsights - A function to retrieve market insights for a given cryptocurrency.
 * - MarketInsightsInput - The input type for the getMarketInsights function.
 * - MarketInsightsOutput - The return type for the getMarketInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getTradeHistorySummary } from '@/services/tradeHistoryService';


const MarketInsightsInputSchema = z.object({
  cryptocurrency: z.string().describe('The user\'s query, which could be a cryptocurrency name or a question about it.'),
  chatHistory: z.string().optional().describe('The recent conversation history between the user and the assistant.'),
});
export type MarketInsightsInput = z.infer<typeof MarketInsightsInputSchema>;

const MarketInsightsOutputSchema = z.object({
  response: z.string().describe('A summary of current market trends, recent news, and analysis for the cryptocurrency, OR a direct answer to a specific question using tools.'),
});
export type MarketInsightsOutput = z.infer<typeof MarketInsightsOutputSchema>;

export async function getMarketInsights(input: MarketInsightsInput): Promise<MarketInsightsOutput> {
  return marketInsightsFlow(input);
}

// Fetches detailed data for a specific crypto symbol from the local API
async function getCryptoInfo(symbol: string) {
    const allCryptosResponse = await fetch('http://localhost:9002/api/all-cryptos');
    if (!allCryptosResponse.ok) {
        throw new Error('Could not fetch crypto list.');
    }
    const allCryptos = await allCryptosResponse.json();
    const crypto = allCryptos.find((c: any) => c.binanceSymbol.toLowerCase() === symbol.toLowerCase());

    if (!crypto) {
        throw new Error(`Could not find data for symbol: ${symbol}`);
    }
    
    return {
        price: crypto.lastPrice,
        volume: 'N/A', // The all-cryptos endpoint does not provide a simple volume field
        quoteVolume: crypto.quoteVolume,
        priceChangePercent: crypto.priceChangePercent,
    };
}


const cryptoInfoTool = ai.defineTool(
  {
    name: 'getCryptoInfo',
    description: 'Get current information for a specific cryptocurrency, such as price, volume, and market cap.',
    inputSchema: z.object({
      symbol: z.string().describe('The trading symbol, e.g., BTCUSDT'),
    }),
    outputSchema: z.object({
      price: z.string(),
      volume: z.string(),
      quoteVolume: z.string(),
      priceChangePercent: z.string(),
    }),
  },
  async ({ symbol }) => {
    return getCryptoInfo(symbol);
  }
);

const tradeHistoryTool = ai.defineTool(
  {
      name: 'getTradeHistorySummary',
      description: 'Analyzes the user\'s past trades to provide insights, summaries, or identify patterns. Use this tool if the user asks questions about their trading performance, win rate, biggest win/loss, or asks for a review of their recent trades.',
      inputSchema: z.object({
        tradeHistoryJson: z.string().describe('The user\'s entire trade history as a JSON string.'),
      }),
      outputSchema: z.string().describe('A concise summary and analysis of the provided trade history, highlighting key metrics and patterns.'),
  },
  async ({ tradeHistoryJson }) => {
      // In a real app, this might do more complex analysis.
      // For now, we'll just summarize what's given.
      return getTradeHistorySummary(tradeHistoryJson);
  }
);


const prompt = ai.definePrompt({
  name: 'marketInsightsPrompt',
  input: {schema: MarketInsightsInputSchema},
  output: {schema: MarketInsightsOutputSchema},
  tools: [cryptoInfoTool, tradeHistoryTool],
  prompt: `You are PLXY AI, a friendly and helpful crypto trading assistant.
  Respond in the same language as the user's query.
  Remember the user's recent conversation history, provided below, to maintain context.

  Recent history:
  {{{chatHistory}}}

  Analyze the user's query: {{{cryptocurrency}}}.

  - If the user asks for a general summary or analysis of a cryptocurrency (e.g., "Give me a summary for Ethereum", "Is SOL looking bullish?"), provide a response that includes:
    1. A very brief summary of the current market trends (1-2 sentences).
    2. A very brief summary of recent news (1-2 sentences).
    3. A slightly more detailed analysis of potential price movements and key factors (3-4 sentences).
    Format this as a single text block for the 'response' field.

  - If the user asks a question about a specific metric like price or volume (e.g., "What's the 24h volume for BTC?"), use the getCryptoInfo tool to get the most current data. Then, formulate a direct, natural language answer to the user's question and provide it in the 'response' field.
  
  - If the user asks to analyze their trades, review their history, or anything related to their personal trading performance (e.g., "Analyze my recent trades", "What's my win rate?"), use the getTradeHistorySummary tool. You MUST be provided with the trade history JSON to use this tool. Formulate a natural language response based on the tool's output for the 'response' field.
  `,
});

const marketInsightsFlow = ai.defineFlow(
  {
    name: 'marketInsightsFlow',
    inputSchema: MarketInsightsInputSchema,
    outputSchema: MarketInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
