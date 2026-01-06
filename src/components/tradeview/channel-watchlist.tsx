
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Star, PlusCircle, MoreHorizontal, Send } from 'lucide-react';
import Link from 'next/link';
import { type Channel, channels as staticChannels } from '@/lib/channel-data';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

const WATCHLIST_KEY = 'tradeview_watchlist_channels';

const WatchlistItemCard = ({ channel }: { channel: Channel }) => {
    const router = useRouter();
    return (
        <div className="w-32 flex-shrink-0">
             <Card 
                onClick={() => router.push(`/channel/${channel.id}`)} 
                className="rounded-2xl p-4 flex flex-col items-center text-center gap-3 cursor-pointer hover:bg-secondary transition-colors h-40"
            >
                <div className="flex justify-between w-full items-start">
                    <span className="text-xs font-semibold truncate">{channel.name}</span>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </div>
                <Avatar className="h-14 w-14 text-xl">
                    <AvatarImage src={channel.avatar || 'https://asset.gaminvest.org/asset/social-trading/telegram.png'} alt={channel.name} />
                    <AvatarFallback>
                        {channel.name ? channel.name.charAt(0) : <Send />}
                    </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground truncate w-full">{channel.subscribers} subs</p>
            </Card>
        </div>
    );
};

const AddChannelCard = () => {
    const router = useRouter();
    return (
        <div className="w-32 flex-shrink-0">
            <Card 
                onClick={() => router.push('/telegram-channels')}
                className="rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 h-40 border-dashed cursor-pointer hover:bg-secondary transition-colors"
            >
                <p className="text-xs font-semibold">Add</p>
                 <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                    <PlusCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">&nbsp;</p>
            </Card>
        </div>
    )
}

export default function ChannelWatchlist() {
    const [watchlistChannels, setWatchlistChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedWatchlistIds: string[] = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
        if (storedWatchlistIds.length > 0) {
            const channelsToShow = staticChannels.filter(channel => storedWatchlistIds.includes(channel.id));
            setWatchlistChannels(channelsToShow);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <div className="h-40 animate-pulse bg-secondary rounded-lg"></div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="bg-transparent shadow-none border-none">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">Watchlist</h2>
            </div>
            {watchlistChannels.length > 0 ? (
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex w-max space-x-4 pb-4">
                        {watchlistChannels.map(channel => (
                            <WatchlistItemCard key={channel.id} channel={channel} />
                        ))}
                         <AddChannelCard />
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            ) : (
                <Card className="rounded-2xl p-4 text-center text-muted-foreground border-dashed flex flex-col items-center justify-center">
                    <Star className="w-8 h-8 mb-2 text-yellow-500/50" />
                    <h3 className="font-semibold">Your Watchlist is Empty</h3>
                    <p className="text-sm mt-1 mb-4">Add channels to your watchlist to track them here.</p>
                    <Link href="/telegram-channels">
                        <Button>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Channel
                        </Button>
                    </Link>
                </Card>
            )}
        </div>
    );
}
