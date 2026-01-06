
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gem, Crown, User, Send, Target, TrendingUp, TrendingDown, ArrowLeft, AreaChart, Search, Clock } from 'lucide-react';
import { type Channel, channels as staticChannels } from '@/lib/channel-data';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';

const WATCHLIST_KEY = 'tradeview_watchlist_channels';
const ANALYZED_CHANNELS_KEY = 'tradeview_analyzed_channels';
const ANALYSIS_CREDITS_KEY = 'tradeview_analysis_credits';
const ANALYSIS_CREDIT_RESET_KEY = 'tradeview_analysis_credit_reset';
const USERNAME_KEY = 'tradeview_username';


function StatCard({ title, value, icon, action }: { title: string, value: string | number, icon: React.ReactNode, action?: React.ReactNode }) {
    const { language } = useTranslation();
    return (
        <Card className="rounded-2xl p-4">
            <div className={cn("flex items-center gap-3", language === 'fa' && 'flex-row-reverse')}>
                <div className="bg-secondary p-2 rounded-lg text-primary">
                    {icon}
                </div>
                <div className={cn(language === 'fa' && 'text-right')}>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-lg font-bold">{value}</p>
                </div>
            </div>
            {action && <div className="mt-4">{action}</div>}
        </Card>
    );
}

function SignalCard({ signal, channelName }: { signal: any, channelName: string }) {
    const { t, language } = useTranslation();
    const isLong = signal.type === 'Long';
    const tradeTypeInitial = isLong ? 'L' : 'S';
    const tradeTypeBg = isLong ? 'bg-green-500' : 'bg-red-500';

    return (
        <Card className="rounded-xl p-3 shadow-sm">
            <div className={cn("flex items-start justify-between mb-2", language === 'fa' && 'flex-row-reverse')}>
                <div className={cn("flex items-center gap-2", language === 'fa' && 'flex-row-reverse')}>
                    <div className={cn("flex items-center justify-center w-8 h-8 rounded-md text-white text-sm font-bold", tradeTypeBg)}>
                        {tradeTypeInitial}
                    </div>
                    <div className={cn(language === 'fa' && 'text-right')}>
                        <h4 className="font-bold text-sm">{signal.asset}/USDT</h4>
                        <p className="text-xs text-muted-foreground">{channelName}</p>
                    </div>
                </div>
                <Badge variant="secondary" className="text-xs">{t('channel_detail.active')}</Badge>
            </div>
            
            <div className="space-y-1.5 text-xs">
                <div className={cn("flex justify-between items-center", language === 'fa' && 'flex-row-reverse')}>
                    <span className="text-muted-foreground">{t('channel_detail.entry')}</span>
                    <span className="font-semibold">${signal.entry}</span>
                </div>
                 {signal.targets.map((target: number, i: number) => (
                    <div key={i} className={cn("flex justify-between items-center", language === 'fa' && 'flex-row-reverse')}>
                        <span className="text-muted-foreground flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-green-500" /> {t('channel_detail.tp')} {i+1}</span>
                        <span className="font-semibold">${target}</span>
                    </div>
                 ))}
                 <div className={cn("flex justify-between items-center", language === 'fa' && 'flex-row-reverse')}>
                    <span className="text-muted-foreground flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-red-500" /> {t('channel_detail.sl')}</span>
                    <span className="font-semibold">${signal.stopLoss}</span>
                </div>
            </div>
        </Card>
    );
}

export default function DashboardPage() {
    const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);
    const [analyzedCount, setAnalyzedCount] = useState(0);
    const [analysisCredits, setAnalysisCredits] = useState(3);
    const [username, setUsername] = useState('User');
    const [countdown, setCountdown] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const { t, language, formatNumber } = useTranslation();

    useEffect(() => {
        const storedUsername = localStorage.getItem(USERNAME_KEY);
        if (storedUsername) setUsername(storedUsername);
        
        const storedSubscribedIds: string[] = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
        const channels = staticChannels.filter(c => storedSubscribedIds.includes(c.id!));
        setSubscribedChannels(channels);
        
        const storedAnalyzedIds: string[] = JSON.parse(localStorage.getItem(ANALYZED_CHANNELS_KEY) || '[]');
        setAnalyzedCount(storedAnalyzedIds.length);

        const storedCredits = localStorage.getItem(ANALYSIS_CREDITS_KEY);
        setAnalysisCredits(storedCredits ? parseInt(storedCredits, 10) : 3);
        
        // Countdown timer logic
        const interval = setInterval(() => {
            const now = new Date();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            const diff = endOfMonth.getTime() - now.getTime();
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            setCountdown(`${formatNumber(days)}d ${formatNumber(hours)}h ${formatNumber(minutes)}m`);
        }, 1000);

        return () => clearInterval(interval);

    }, [formatNumber]);
  
    const activeSignals = subscribedChannels.flatMap(channel => 
        channel.signals.filter(signal => signal.status === 'active').map(signal => ({ ...signal, channelName: channel.name }))
    );

    const handleViewReports = () => {
        toast({
            title: t('dashboard.coming_soon_title'),
            description: t('dashboard.coming_soon_desc'),
        });
    }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
        <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-blue-500 text-white">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">{t('dashboard.title')}</h1>
        </header>
        <main className={cn("flex-grow container mx-auto max-w-2xl px-4 flex flex-col space-y-6 pb-8 pt-6", language === 'fa' && 'rtl')}>
            <div className={cn("flex items-baseline", language === 'fa' ? 'text-right justify-end' : 'text-left')}>
                <h2 className="text-2xl font-bold">{t('dashboard.welcome_prefix')}</h2>
                <span dir="ltr" className="text-2xl font-bold ml-1">{username}!</span>
            </div>
            <p className={cn("text-muted-foreground -mt-5", language === 'fa' ? 'text-right' : 'text-left')}>{t('dashboard.summary_subtitle')}</p>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-primary-foreground">
                    <CardHeader className={cn(language === 'fa' && 'text-right')}>
                         <CardTitle className={cn("flex items-center justify-between", language === 'fa' ? 'flex-row-reverse' : '')}>
                            <div className={cn("flex items-center gap-2", language === 'fa' && 'flex-row-reverse')}>
                                <Gem className="w-5 h-5" />
                                <span>{t('dashboard.free_plan')}</span>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => router.push('/premium')}>{t('dashboard.upgrade')}</Button>
                        </CardTitle>
                        <CardDescription className="text-primary-foreground/80 pt-2">
                            {t('dashboard.free_plan_desc')}
                        </CardDescription>
                    </CardHeader>
                </Card>
                 <Card className="rounded-2xl">
                     <CardHeader className={cn(language === 'fa' && 'text-right')}>
                        <CardTitle className={cn("text-base flex items-center gap-2", language === 'fa' && 'flex-row-reverse')}>
                            <Search className="w-5 h-5 text-muted-foreground"/>
                            {t('dashboard.analysis_stats')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <div className={cn("flex justify-between items-center", language === 'fa' && 'flex-row-reverse')}>
                            <span className="text-sm">{t('dashboard.analyzed_channels')}</span>
                            <span className="font-bold">{formatNumber(analyzedCount)}</span>
                        </div>
                         <div className={cn("flex justify-between items-center", language === 'fa' && 'flex-row-reverse')}>
                            <span className="text-sm">{t('dashboard.remaining_credits')}</span>
                            <div className={cn("flex items-center gap-2", language === 'fa' && 'flex-row-reverse')}>
                                <span className="font-bold">{formatNumber(analysisCredits)}</span>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{countdown}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" onClick={handleViewReports}>{t('dashboard.view_reports')}</Button>
                    </CardContent>
                </Card>
            </div>
            
            <StatCard
                title={t('dashboard.subscribed_channels')}
                value={formatNumber(subscribedChannels.length)}
                icon={<Send className="w-6 h-6" />}
                action={<Button variant="secondary" size="sm" className="w-full" onClick={() => router.push('/your-channels')}>{t('dashboard.view')}</Button>}
            />


            <div className={cn(language === 'fa' && 'text-right')}>
                <h2 className="text-xl font-bold mb-3">{t('dashboard.subscribed_signals')}</h2>
                {activeSignals.length > 0 ? (
                    <div className="space-y-3">
                        {activeSignals.map(signal => (
                            <SignalCard key={signal.id} signal={signal} channelName={signal.channelName} />
                        ))}
                    </div>
                ) : (
                    <Card className="rounded-xl border-dashed">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            <p>{t('dashboard.no_active_signals')}</p>
                            <Button variant="link" className="mt-2" onClick={() => router.push('/telegram-channels')}>{t('dashboard.browse_channels')}</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
            
        </main>
    </div>
  );
}
