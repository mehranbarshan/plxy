

"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Star, TrendingUp, TrendingDown, Target, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TakeProfitTarget {
    id: number;
    price: string;
    percentage: number;
}

export interface CommunitySignal {
    id: string; // Unique ID for the signal
    tradeType: 'Long' | 'Short';
    ticker: string;
    traderId: string;
    traderName: string;
    traderFollowers: string;
    traderAvatar: string;
    leverage: number;
    timestamp: string;
    takeProfitTargets?: TakeProfitTarget[];
    stopLoss?: string;
}

const getInitialCommunitySignals = (): CommunitySignal[] => {
    const username = typeof window !== 'undefined' ? localStorage.getItem('tradeview_username') || 'John Doe' : 'John Doe';
    const userAvatar = typeof window !== 'undefined' ? localStorage.getItem('tradeview_avatar') || 'https://picsum.photos/seed/1/100/100' : 'https://picsum.photos/seed/1/100/100';

    return [
        {
            id: "btc-alex-chen-example",
            tradeType: "Long",
            ticker: "BTC",
            traderId: "alex-chen",
            traderName: "Alex Chen",
            traderFollowers: "2.3K",
            traderAvatar: "https://picsum.photos/seed/18/100/100",
            leverage: 50,
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
            takeProfitTargets: [{ id: 1, price: "70000", percentage: 5 }, { id: 2, price: "72000", percentage: 10 }],
            stopLoss: "65000",
        },
        {
            id: "eth-sarah-miller-example",
            tradeType: "Short",
            ticker: "ETH",
            traderId: "sarah-miller",
            traderName: "Sarah Miller",
            traderFollowers: "1.8K",
            traderAvatar: "https://picsum.photos/seed/19/100/100",
            leverage: 20,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            takeProfitTargets: [{ id: 1, price: "3800", percentage: 4 }],
            stopLoss: "4200",
        },
    ];
};


const COMMUNITY_SIGNALS_KEY = 'tradeview_community_signals';

function SignalCard({ signal, onRemove, currentUserId }: { signal: CommunitySignal, onRemove: (id: string) => void, currentUserId: string }) {
    const { toast } = useToast();
    const { id, tradeType, ticker, traderId, traderName, traderFollowers, traderAvatar, leverage, timestamp, takeProfitTargets, stopLoss } = signal;

    const handleCopySignal = () => {
        toast({
            title: "Signal Copied!",
            description: "This is for demonstration purposes."
        })
    }
    
    const isCurrentUserSignal = traderId === currentUserId;
    const isLong = tradeType === 'Long';
    const tradeTypeInitial = tradeType === 'Long' ? 'L' : 'S';
    const tradeTypeBg = tradeType === 'Long' ? 'bg-green-500' : 'bg-red-500';

    return (
        <Card className="rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg text-white text-base font-bold", tradeTypeBg)}>
                        {tradeTypeInitial}
                    </div>
                    <div>
                         <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm">
                                {ticker}
                              </h3>
                              <Badge variant="outline" className="text-xs px-1.5 py-0">Futures</Badge>
                              <Badge variant="outline" className="text-xs px-1.5 py-0">{leverage}x</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</p>
                    </div>
                </div>
            </div>

            {(takeProfitTargets && takeProfitTargets.length > 0) || stopLoss ? (
                 <div className="space-y-3 my-4">
                    {takeProfitTargets && takeProfitTargets.map((tp, index) => (
                        <div key={tp.id} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 text-green-500">
                                <Target className="w-3.5 h-3.5" />
                                <span>TP {index + 1}</span>
                            </div>
                            <span className="font-semibold text-foreground">${parseFloat(tp.price).toLocaleString()}</span>
                        </div>
                    ))}
                    {stopLoss && (
                        <div className="flex justify-between items-center text-xs">
                             <div className="flex items-center gap-2 text-red-500">
                                <Target className="w-3.5 h-3.5" />
                                <span>SL</span>
                            </div>
                            <span className="font-semibold text-foreground">${parseFloat(stopLoss).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            ) : null}


             <div className="flex justify-between items-center mt-4 pt-4 border-t">
                 <div className="flex items-center gap-3">
                     <Link href={`/trader/${traderId}`}>
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={traderAvatar} alt={traderName} data-ai-hint="person portrait" />
                            <AvatarFallback>{traderName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <Link href={`/trader/${traderId}`}>
                            <h3 className="font-bold text-sm">{traderName}</h3>
                        </Link>
                        <p className="text-xs text-muted-foreground">{traderFollowers} followers</p>
                    </div>
                </div>
                {isCurrentUserSignal ? (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-9 text-xs">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove Signal?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to remove this signal from the community feed? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onRemove(id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                    Yes, Remove
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <Button onClick={handleCopySignal} className="bg-foreground text-background hover:bg-foreground/90 h-9 text-sm">Copy Signal</Button>
                )}
            </div>
        </Card>
    )
}

export default function CommunitySignalsTab() {
    const [signals, setSignals] = useState<CommunitySignal[]>([]);
    const [currentUserId, setCurrentUserId] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const username = localStorage.getItem('tradeview_username') || '';
        setCurrentUserId(username.toLowerCase().replace(/\s+/g, '-'));
        
        const storedSignals = localStorage.getItem(COMMUNITY_SIGNALS_KEY);
        if (storedSignals) {
            setSignals(JSON.parse(storedSignals));
        } else {
            // Set initial data if nothing is in localStorage
            const initialSignals = getInitialCommunitySignals();
            setSignals(initialSignals);
            localStorage.setItem(COMMUNITY_SIGNALS_KEY, JSON.stringify(initialSignals));
        }
    }, []);
    
    const handleRemoveSignal = (id: string) => {
        const updatedSignals = signals.filter(signal => signal.id !== id);
        setSignals(updatedSignals);
        localStorage.setItem(COMMUNITY_SIGNALS_KEY, JSON.stringify(updatedSignals));
        toast({
            title: "Signal Removed",
            description: "Your signal has been removed from the community feed.",
        });
    };


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Community Signals</h2>
                <Button variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    Top Rated
                </Button>
            </div>
            {signals.length > 0 ? (
                signals.map((signal) => <SignalCard key={signal.id} signal={signal} onRemove={handleRemoveSignal} currentUserId={currentUserId} />)
            ) : (
                <Card className="rounded-2xl p-6 text-center text-muted-foreground">
                    No community signals available yet.
                </Card>
            )}
        </div>
    )
}
