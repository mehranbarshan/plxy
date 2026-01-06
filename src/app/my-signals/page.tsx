
"use client";

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Target, Users, Rss, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { IChannel, ISignal } from '@/app/models/Channel';
import ProfileStatCard from '../../components/tradeview/profile-stat-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


const WATCHLIST_KEY = 'tradeview_watchlist_channels';

// Define EnrichedSignal as a plain object type, not extending a Mongoose document.
interface EnrichedSignal {
    _id?: any;
    id?: string;
    type: 'Long' | 'Short';
    asset: string;
    entry: number;
    targets: number[];
    stopLoss?: number;
    timestamp: string;
    status: 'active' | 'closed';
    pnl?: number;
    channelName: string;
    channelAvatar: string;
    channelId: string;
}

function SignalCard({ signal }: { signal: EnrichedSignal }) {
    const {
        type,
        asset,
        channelName,
        channelAvatar,
        channelId,
        timestamp,
        entry,
        targets,
        stopLoss,
    } = signal;
    
    const isLong = type === 'Long';
    const tradeTypeInitial = type === 'Long' ? 'L' : 'S';
    const tradeTypeBg = type === 'Long' ? 'bg-green-500' : 'bg-red-500';

    return (
        <Card className="rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <Link href={`/channel/${channelId}`}>
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={channelAvatar} alt={channelName} />
                            <AvatarFallback>{channelName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                         <Link href={`/channel/${channelId}`}>
                             <h3 className="font-bold text-sm">{channelName}</h3>
                         </Link>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn("flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold", tradeTypeBg)}>
                        {tradeTypeInitial}
                    </div>
                     <h3 className="font-semibold text-sm">
                        {asset}
                      </h3>
                </div>
            </div>

            {(targets && targets.length > 0) || stopLoss ? (
                 <div className="space-y-3 my-4">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="w-3.5 h-3.5" />
                            <span>Entry</span>
                        </div>
                        <span className="font-semibold text-foreground">${entry.toLocaleString()}</span>
                    </div>
                    {targets && targets.map((tp, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 text-green-500">
                                <Target className="w-3.5 h-3.5" />
                                <span>TP {index + 1}</span>
                            </div>
                            <span className="font-semibold text-foreground">${tp.toLocaleString()}</span>
                        </div>
                    ))}
                     {stopLoss && (
                        <div className="flex justify-between items-center text-xs">
                             <div className="flex items-center gap-2 text-red-500">
                                <Target className="w-3.5 h-3.5" />
                                <span>SL</span>
                            </div>
                            <span className="font-semibold text-foreground">${stopLoss.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            ) : null}

        </Card>
    )
}

function MySignalsPageContent() {
  const router = useRouter();
  const [followedChannelsCount, setFollowedChannelsCount] = useState(0);
  const [activeSignals, setActiveSignals] = useState<EnrichedSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      setLoading(true);
      try {
        const storedIds: string[] = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
        
        if (storedIds.length > 0) {
          const response = await fetch('/api/channels');
          if (!response.ok) {
            throw new Error('Failed to fetch channels');
          }
          const allChannels: IChannel[] = await response.json();
          
          const followedChannels = allChannels.filter(c => 
              c.channelId && 
              storedIds.includes(c.channelId.toLowerCase()) && 
              c.isSignalChannel === true
          );

          setFollowedChannelsCount(followedChannels.length);
          
          const signalsFromFollowed: EnrichedSignal[] = followedChannels.flatMap(channel => 
            (channel.signals || []).filter(signal => signal.status === 'active').map(signal => ({
              ...signal,
              channelName: channel.name,
              channelAvatar: channel.avatar,
              channelId: channel.channelId,
            }))
          ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          setActiveSignals(signalsFromFollowed);
        } else {
            setActiveSignals([]);
            setFollowedChannelsCount(0);
        }
      } catch (error) {
        console.error("Error fetching signals for watchlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSignals();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold">My Signals</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto max-w-2xl p-4 pt-0 pb-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
             <ProfileStatCard
                icon={<Send className="w-6 h-6" />}
                title="Followed Channels"
                value={followedChannelsCount.toString()}
            />
            <ProfileStatCard
                icon={<Rss className="w-6 h-6" />}
                title="Active Signals"
                value={activeSignals.length.toString()}
            />
        </div>

        {loading ? (
             <div className="space-y-4">
                <Card className="p-4 rounded-2xl animate-pulse"><div className="h-48 bg-secondary rounded-lg"></div></Card>
                <Card className="p-4 rounded-2xl animate-pulse"><div className="h-48 bg-secondary rounded-lg"></div></Card>
             </div>
        ) : activeSignals.length > 0 ? (
             <div className="space-y-4">
                {activeSignals.map((signal) => <SignalCard key={signal._id?.toString() || signal.id} signal={signal} />)}
            </div>
        ) : (
             <Card className="rounded-2xl p-6 text-center text-muted-foreground mt-8">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold">No Active Signals</h3>
                <p className="mt-1 text-sm">
                    Signals from channels you follow will appear here.
                </p>
                <Link href="/telegram-channels">
                    <Button variant="outline" className="mt-4">
                        Browse Channels
                    </Button>
                </Link>
             </Card>
        )}

      </main>
    </div>
  );
}


export default function MySignalsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MySignalsPageContent />
        </Suspense>
    )
}
 
