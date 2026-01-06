
'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { getMarketInsights, MarketInsightsOutput } from '@/ai/flows/market-insights';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import type { IChannel } from '@/app/models/Channel';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Send } from 'lucide-react';


type MarketInsightsSheetProps = {
  channel: Partial<IChannel> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MarketInsightsSheet({ channel, open, onOpenChange }: MarketInsightsSheetProps) {
  const [insights, setInsights] = useState<MarketInsightsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channel && open) {
      setLoading(true);
      setInsights(null);
      setError(null);
      
      // Determine what to analyze. Prioritize the first signal's asset, otherwise use the channel name.
      const assetToAnalyze = (channel.signals && channel.signals.length > 0)
        ? channel.signals[0].asset
        : channel.name;

      if (!assetToAnalyze) {
        setError('No valid cryptocurrency name found to analyze for this channel.');
        setLoading(false);
        return;
      }
      
      getMarketInsights({ cryptocurrency: assetToAnalyze })
        .then(setInsights)
        .catch(() => setError('Failed to load market insights. Please try again.'))
        .finally(() => setLoading(false));
    }
  }, [channel, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl h-[85%]">
        {channel && (
           <SheetHeader className="text-left mb-4">
              <div className="flex items-center gap-4">
                 <Avatar className="h-12 w-12">
                    <AvatarImage src={channel.avatar || 'https://asset.gaminvest.org/asset/social-trading/telegram.png'} />
                    <AvatarFallback>
                        {channel.name ? channel.name.charAt(0) : <Send />}
                    </AvatarFallback>
                </Avatar>
                 <div>
                    <SheetTitle className="text-2xl font-bold">{channel.name} Insights</SheetTitle>
                    <SheetDescription>AI-powered analysis of this channel</SheetDescription>
                 </div>
              </div>
           </SheetHeader>
        )}
        <Separator className="mb-6"/>
        <div className="space-y-6 overflow-y-auto h-[calc(100%-120px)] pr-4">
          {loading && <LoadingState />}
          {error && <p className="text-destructive">{error}</p>}
          {insights && (
            <div className="space-y-4 text-sm whitespace-pre-wrap">
              <p>{insights.response}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8">
        <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
        </div>
    </div>
  );
}
