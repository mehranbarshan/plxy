

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { IChannel, ISignal } from '@/app/models/Channel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, Bell, Share2, LogOut, Info, Clock, Target, Check, X, Copy, Link as LinkIcon, Verified, UserPlus, TrendingUp, Shield, Star, Plus, Trash2, Search, Gem, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import MarketInsightsSheet from '@/components/tradeview/market-insights-sheet';
import { useTranslation } from '@/context/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';
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


const WATCHLIST_KEY = 'tradeview_watchlist_channels';

// Function to get the correct entry price from a string that might be a range
const getEntryPrice = (entry: string | number): number => {
    if (typeof entry === 'number') {
        return entry;
    }
    if (typeof entry === 'string') {
        const parts = entry.split('-').map(part => parseFloat(part.trim()));
        if (parts.length > 1 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return (parts[0] + parts[1]) / 2; // Average of the range
        }
        if (!isNaN(parts[0])) {
            return parts[0];
        }
    }
    return 0;
};

function SignalCard({ signal }: { signal: any }) {
    const { t, language, formatNumber } = useTranslation();
    const isLong = signal.type === 'Long';
    const isWin = signal.pnl ? signal.pnl >= 0 : undefined;
    
    const locale = language === 'fa' ? faIR : undefined;

    return (
        <Card className="rounded-xl p-3 shadow-sm">
             <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={cn("flex items-center justify-center w-8 h-8 rounded-md text-white text-sm font-bold", isLong ? 'bg-green-500' : 'bg-red-500')}>
                        {isLong ? 'L' : 'S'}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">{signal.asset}/USDT</h4>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true, locale })}</p>
                    </div>
                </div>
                {signal.status === 'closed' ? (
                     <div className={cn("text-right", isWin ? 'text-green-500' : 'text-red-500')}>
                        <p className="font-bold text-sm">{isWin ? '+' : ''}{formatNumber(signal.pnl || 0)}%</p>
                        <p className="text-xs">{t('channel_detail.pnl')}</p>
                    </div>
                ) : (
                     <Badge variant="secondary" className="text-xs">{t('channel_detail.active')}</Badge>
                )}
            </div>
            
            <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('channel_detail.entry')}</span>
                    <span className="font-semibold">${formatNumber(getEntryPrice(signal.entry))}</span>
                </div>
                 {signal.targets.map((target: number, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-green-500" /> {t('channel_detail.tp')} {formatNumber(i+1)}</span>
                        <span className="font-semibold">${formatNumber(target)}</span>
                    </div>
                 ))}
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-red-500" /> {t('channel_detail.sl')}</span>
                    <span className="font-semibold">{signal.stopLoss ? `$${formatNumber(signal.stopLoss)}` : '-'}</span>
                </div>
            </div>

        </Card>
    )
}

function StatCard({ icon, value, label, valueIsIcon=false, secondaryIcon }: { icon: React.ReactNode, value?: string | React.ReactNode, label: React.ReactNode, valueIsIcon?: boolean, secondaryIcon?: React.ReactNode }) {
    const CardContentWrapper = () => (
         <CardContent className="p-0 flex flex-col items-center justify-center text-center gap-1 text-white">
            <div className="text-white/90 relative h-7">
              {icon}
              {secondaryIcon && <div className="absolute -bottom-2 right-[-8px] text-white/70">{secondaryIcon}</div>}
            </div>
            {valueIsIcon ? (
              <div className="text-sm font-bold text-white/90">{value}</div>
            ) : value ? (
              <p className="text-sm font-bold">{value}</p>
            ) : (
              <div className="text-white/90"><Search className="w-5 h-5"/></div>
            )}
            <div className="text-xs text-white/70 flex items-center gap-1">{label}</div>
        </CardContent>
    )
    
    return (
        <Card className="rounded-xl flex-1 p-3 bg-white/20 dark:bg-secondary/80 border-none">
            <CardContentWrapper />
        </Card>
    );
}

const AnalysisPrompt = ({ onAnalyze, credits, isLoading }: { onAnalyze: () => void, credits: number, isLoading: boolean }) => {
    const { t } = useTranslation();
    return (
        <Card className="rounded-2xl p-6 text-center mt-4 bg-card border-border">
            <Search className="mx-auto w-12 h-12 text-primary mb-4" />
            <h2 className="text-xl font-bold text-foreground">{t('channel_detail.analysis_required.title')}</h2>
            <p className="text-muted-foreground mt-2 mb-4 text-sm">{t('channel_detail.analysis_required.credits_left', { credits: credits.toString() })}</p>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="mt-4" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                        {isLoading ? 'Analyzing...' : t('channel_detail.analysis_required.analyze_button')}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('channel_detail.analyze_dialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('channel_detail.analyze_dialog.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('channel_detail.analyze_dialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={onAnalyze}>{t('channel_detail.analyze_dialog.confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};


function ChannelProfileContent() {
    const router = useRouter();
    const params = useParams();
    const channelId = (params.id as string).toLowerCase();
    const { toast } = useToast();
    const { t, language, formatNumber } = useTranslation();
    
    const [channel, setChannel] = useState<Partial<IChannel> | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [showHeaderInfo, setShowHeaderInfo] = useState(false);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    
    const formatSubscribers = (subs: number | string | undefined): string => {
        if (subs === undefined || subs === null) return `N/A`;
        if (typeof subs === 'string') {
            const num = parseInt(subs.replace(/[^0-9]/g, ''), 10);
            if(isNaN(num)) return subs;
            return t('channel_detail.subscriber_count', { count: formatNumber(num) });
        }
        if (isNaN(subs)) return `N/A`;

        return t('channel_detail.subscriber_count', { count: formatNumber(subs) });
    };

    useEffect(() => {
        const handleScroll = () => {
          if (window.scrollY > 50) {
            setShowHeaderInfo(true);
          } else {
            setShowHeaderInfo(false);
          }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);

    useEffect(() => {
        async function fetchChannelData() {
            if (!channelId) return;

            try {
                const response = await fetch(`/api/channels`);
                if (!response.ok) {
                    throw new Error("Failed to fetch channel list.");
                }
                const allChannels: IChannel[] = await response.json();
                
                if (!Array.isArray(allChannels)) {
                    throw new Error("Invalid data received from server.");
                }
                
                const foundChannel = allChannels.find(c => c.channelId.toLowerCase() === channelId);

                if (!foundChannel) {
                    toast({
                      variant: 'destructive',
                      title: 'Channel not found',
                      description: "The requested channel does not exist or could not be loaded."
                    });
                    router.push('/telegram-channels');
                } else {
                    setChannel(foundChannel);
                    if (foundChannel.isSignalChannel === false) {
                        toast({
                            variant: 'default',
                            title: 'Not a Signal Channel',
                            description: `Our analysis indicates this is not a trading signal channel.`,
                        });
                    }
                    const storedSubscriptions: string[] = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
                    setIsSubscribed(storedSubscriptions.includes(channelId));
                }
            } catch (error) {
                console.error("Failed to fetch channel data", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error instanceof Error ? error.message : "Could not load channel data."
                });
            }
        }
        
        fetchChannelData();
    }, [channelId, router, toast]);
    
    const handleJoin = () => {
        if(channel?.url) {
            window.open(channel.url, '_blank');
        } else {
             toast({
                title: t('channel_detail.toast.joining_demo_title'),
                description: t('channel_detail.toast.joining_demo_desc', { channelName: channel?.name || '' })
            });
        }
    }

    const handleAction = (actionName: string) => {
        toast({
            title: `\'\'\'${actionName} (Demo)`,
            description: `This action is for demonstration purposes.`,
        });
    }

    const toggleSubscription = () => {
        if (!channel?.channelId) return;
        const storedSubscriptions: string[] = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
        let updatedSubscriptions: string[];
        const lowerCaseChannelId = channel.channelId.toLowerCase();

        if (isSubscribed) {
            updatedSubscriptions = storedSubscriptions.filter(id => id.toLowerCase() !== lowerCaseChannelId);
            toast({ title: t('channel_detail.toast.unsubscribed', { channelName: channel.name || '' }) });
        } else {
            updatedSubscriptions = [...storedSubscriptions, lowerCaseChannelId];
            toast({ title: t('channel_detail.toast.subscribed', { channelName: channel.name || '' }) });
        }

        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedSubscriptions));
        setIsSubscribed(!isSubscribed);
    };

    const handleAnalyze = async () => {
        if (!channel || !channel.channelId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Channel data is missing.' });
            return;
        }
        setIsLoadingAnalysis(true);
        try {
            await fetch('/api/analyze-channel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelUrl: channel.url || channel.channelId }),
            });
            toast({
                title: 'Analysis in Progress',
                description: 'The channel is being analyzed. The data will appear here shortly.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Analysis Error',
                description: error.message || 'Could not start channel analysis.',
            });
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    if (!channel) {
        return (
            <div className="flex flex-col min-h-screen bg-background font-body items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }
    
    const isAnalyzed = typeof channel.isSignalChannel !== 'undefined';

    const formatReviews = (num: number | undefined) => {
        if (typeof num === 'undefined' || isNaN(num)) return 'N/A';
        if (num >= 1000) {
            return t('channel_detail.reviews_k', { count: formatNumber(parseFloat((num / 1000).toFixed(1))) });
        }
        return t('channel_detail.reviews', { count: formatNumber(num) });
    }
    
    const ActionButton = () => {
        if (isSubscribed) {
            return (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <div className="rounded-xl flex-1 p-3 h-auto flex flex-col items-center justify-center text-center gap-1 bg-white/90 text-blue-600 hover:bg-white cursor-pointer">
                            <div className="text-current"><Check className="w-5 h-5"/></div>
                            <div className="text-xs font-semibold">{t('channel_detail.unsubscribe')}</div>
                        </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('channel_detail.unsubscribe_dialog.title')}</AlertDialogTitle>
                            <AlertDialogDescription className={cn(language === 'fa' && 'rtl-text')}>
                               {t('channel_detail.unsubscribe_dialog.description', { channelName: channel?.name || 'this channel' })}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('channel_detail.unsubscribe_dialog.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={toggleSubscription} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                {t('channel_detail.unsubscribe_dialog.confirm')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        }

        return (
            <div
                onClick={toggleSubscription}
                className="rounded-xl flex-1 p-3 h-auto flex flex-col items-center justify-center text-center gap-1 bg-white/20 text-white hover:bg-white/30 cursor-pointer"
            >
                <div className="text-current"><Plus className="w-5 h-5"/></div>
                <div className="text-xs font-semibold">{t('channel_detail.subscribe')}</div>
            </div>
        );
    }
    
    const subscriberCount = formatSubscribers(channel.subscribers);

    return (
        <>
        <div className="flex flex-col min-h-screen bg-background font-body">
             <header className="sticky top-0 z-20 p-4 flex items-center justify-between container mx-auto max-w-2xl bg-blue-500 dark:bg-background">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white dark:text-muted-foreground hover:bg-transparent dark:hover:bg-transparent hover:text-white dark:hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <AnimatePresence>
                    {showHeaderInfo && channel && (
                        <motion.div
                        className="absolute left-14 flex flex-col items-start"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-base font-bold text-white dark:text-foreground">{channel.name}</h2>
                            <p className="text-xs text-blue-200 dark:text-muted-foreground">
                                {subscriberCount}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-white dark:text-muted-foreground hover:bg-transparent dark:hover:bg-transparent hover:text-white dark:hover:text-foreground">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleJoin}>
                               <UserPlus className="w-4 h-4 mr-2"/>
                               {t('channel_detail.join')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Share')}>
                               <Share2 className="w-4 h-4 mr-2"/>
                               {t('channel_detail.share')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAction('Mute')}>
                               <Bell className="w-4 h-4 mr-2"/>
                               {t('channel_detail.mute')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

            </header>
             <div className="bg-blue-500 dark:bg-background pb-6">
                 <div className="container mx-auto max-w-2xl px-4">
                    <div className="flex flex-col items-center text-center">
                        <Avatar className="w-24 h-24 border-4 border-background dark:border-card shadow-lg">
                            <AvatarImage 
                                src={`/api/avatar/${channel.channelId}`} 
                                alt={channel.name} 
                            />
                            <AvatarFallback>{channel.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                         <div className="flex items-center gap-2 mt-4">
                            <h1 className="text-2xl font-bold text-white dark:text-foreground">{channel.name}</h1>
                            {isAnalyzed && channel.rating && channel.rating > 4.5 && <Verified className="w-6 h-6 text-white dark:text-blue-500 fill-current" />}
                        </div>
                        <p className="text-blue-200 dark:text-muted-foreground mt-1">
                            {subscriberCount}
                        </p>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <StatCard
                        icon={<TrendingUp className="w-5 h-5" />}
                        secondaryIcon={<Search className="w-4 h-4" />}
                        value={isAnalyzed && channel.accuracy ? `${formatNumber(channel.accuracy)}%` : undefined}
                        label={t('channel_detail.accuracy')}
                      />
                      <StatCard
                        icon={<Shield className="w-5 h-5" />}
                        value={isAnalyzed && channel.risk ? channel.risk : undefined}
                        valueIsIcon={!isAnalyzed}
                        label={
                            <div className="text-xs text-white/70 flex items-center gap-1">
                                {t('channel_detail.risk')}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-3 h-3 text-white/70" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-left">
                                        <p>{t('channel_detail.risk_tooltip.low')}</p>
                                        <p>{t('channel_detail.risk_tooltip.medium')}</p>
                                        <p>{t('channel_detail.risk_tooltip.high')}</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                            </div>
                        }
                      />
                      <ActionButton />
                    </div>
                </div>
            </div>

            <main className="flex-grow container mx-auto max-w-2xl px-4 pb-4">
                <Tabs defaultValue="signals" className="w-full">
                    <Separator className="mb-2 mt-2" />
                    <TabsList className="bg-transparent p-0 h-auto">
                        <TabsTrigger value="signals" className="channel-detail-tabs-trigger">{t('channel_detail.tabs.signals')}</TabsTrigger>
                        <TabsTrigger value="about" className="channel-detail-tabs-trigger">{t('channel_detail.tabs.about')}</TabsTrigger>
                        <TabsTrigger value="reviews" className="channel-detail-tabs-trigger">{t('channel_detail.tabs.reviews')}</TabsTrigger>
                    </TabsList>
                    <div className="w-full mt-2">
                      <Separator />
                    </div>
                    <TabsContent value="signals" className="mt-4 space-y-3">
                        {isAnalyzed ? (
                             channel.signals && channel.signals.length > 0 ? (
                                channel.signals.map(signal => <SignalCard key={signal._id?.toString()} signal={signal} />)
                            ) : (
                                <Card className="p-6 text-center text-muted-foreground">{t('channel_detail.no_signals')}</Card>
                            )
                        ) : (
                            <AnalysisPrompt onAnalyze={handleAnalyze} credits={3} isLoading={isLoadingAnalysis} />
                        )}
                    </TabsContent>
                    <TabsContent value="about" className="mt-4">
                         <Card className="rounded-2xl">
                            <CardContent className="p-4 space-y-4">
                                <p className="text-sm">{channel.description}</p>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-blue-500 font-semibold">{channel.url?.replace('https://', '')}</div>
                                    <Button variant="ghost" size="icon">
                                        <Copy className="w-4 h-4 text-muted-foreground"/>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="reviews" className="mt-4">
                        {isAnalyzed ? (
                           <Card className="p-6 text-center text-muted-foreground">{t('channel_detail.no_reviews')}</Card>
                        ) : (
                            <AnalysisPrompt onAnalyze={handleAnalyze} credits={3} isLoading={isLoadingAnalysis} />
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
        <MarketInsightsSheet 
          channel={channel as any}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
        </>
    )
}


export default function ChannelProfilePage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div className="flex flex-col min-h-screen bg-background font-body items-center justify-center"><p>{t('loading')}</p></div>}>
            <ChannelProfileContent />
        </Suspense>
    );
}
