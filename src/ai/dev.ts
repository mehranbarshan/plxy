import { config } from 'dotenv';
config();

import '@/ai/flows/market-insights.ts';
import '@/ai/flows/image-moderation.ts';
import '@/services/tradeHistoryService.ts';
