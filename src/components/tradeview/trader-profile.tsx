
"use client"

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  DollarSign,
  MapPin,
  MessageCircle,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  X,
  Flame,
  TrendingDown,
  Eye,
  BarChartHorizontal,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { Trader } from '@/lib/trader-data';
import { traders, getTraderById as getTraderDataById } from '@/lib/trader-data';
import { useEffect, useState, useMemo } from 'react';
import type { CommunitySignal } from '@/components/tradeview/community-signals-tab';
import { formatDistanceToNow } from 'date-fns';
import type { ClosedSignal } from '@/lib/types';
import AppHeader from '@/components/tradeview/app-header';


const USERNAME_KEY = 'tradeview_username';
const COMMUNITY_SIGNALS_KEY = 'tradeview_community_signals';
const HISTORY_STORAGE_KEY = 'tradeview_signal_history';
const STATS_TOTAL_TRADES_KEY = 'tradeview_total_trades';
const INITIAL_TRADES_TO_SHOW = 5;
const INITIAL_PORTFOLIO_VALUE = 15000; // Futures + Spot initial balance
const PROFILE_VISIBILITY_KEY = 'tradeview_profile_visibility';


interface ProfileVisibilitySettings {
    username: string;
    location: string;
    specialties: string;
    winRateVisible: boolean;
    pnlVisible: boolean;
    aumVisible: boolean;
}

function StatCard({ icon, value, label, isPrivate = false }: { icon: React.ReactNode, value: string, label: string, isPrivate?: boolean }) {
    if (isPrivate) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-4 rounded-2xl shadow-sm h-32 bg-secondary">
                <div className="text-muted-foreground mb-2"><EyeOff className="w-8 h-8"/></div>
                <p className="text-xs text-muted-foreground">{label}</p>
                 <p className="text-sm font-semibold">Private</p>
            </Card>
        );
    }
    
    return (
        <Card className="flex flex-col items-center justify-center text-center p-4 rounded-2xl shadow-sm h-32">
            <div className="text-primary mb-2">{icon}</div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </Card>
    );
}

function TradeHistoryCard({ signal }: { signal: ClosedSignal }) {
    const isLong = signal.tradeType === 'Long';
    const isWin = signal.pnl >= 0;
    const tradeTypeInitial = isLong ? 'L' : 'S';
    const tradeTypeBg = isLong ? 'bg-green-500' : 'bg-red-500';

    const safeFormatDistanceToNow = (timestamp?: string) => {
        if (!timestamp || isNaN(new Date(timestamp).getTime())) {
            return 'a few moments ago';
        }
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch (error) {
            return 'Invalid date';
        }
    };

    return (
        <Card className="rounded-2xl p-4">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg text-white text-base font-bold", tradeTypeBg)}>
                        {tradeTypeInitial}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold">{signal.ticker.replace("USDT","")}</h3>
                           <Badge variant="outline" className="text-xs px-1.5 py-0">{signal.positionMode === 'futures' ? "Futures" : "Spot"}</Badge>
                           {signal.positionMode === 'futures' && <Badge variant="outline" className="text-xs px-1.5 py-0">{signal.leverage}x</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {safeFormatDistanceToNow(signal.closeTimestamp)}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={cn("font-bold", isWin ? 'text-green-500' : 'text-red-500')}>{isWin ? '+' : ''}{signal.roe.toFixed(2)}%</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                        Closed
                    </Badge>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-xs text-muted-foreground">Entry</p>
                    <p className="font-semibold">${signal.entryPrice.toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-muted-foreground">Exit</p>
                    <p className="font-semibold">${signal.closePrice.toLocaleString()}</p>
                 </div>
            </div>
        </Card>
    )
}

function MonthlyPerformanceCard() {
    const performanceData = [
        { month: "Dec 2024", change: "+24.5%" },
        { month: "Nov 2024", change: "+18.2%" },
        { month: "Oct 2024", change: "+31.7%" },
        { month: "Sep 2024", change: "+12.8%" },
        { month: "Aug 2024", change: "+19.4%" },
        { month: "Jul 2024", change: "+27.1%" },
    ];
    const [userAvatar, setUserAvatar] = useState('/default-avatar.png');
    
    useEffect(() => {
        const avatar = localStorage.getItem('tradeview_avatar');
        if (avatar) {
            setUserAvatar(avatar);
        }
    }, []);

    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle className="text-base font-bold">Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {performanceData.map(item => (
                    <div key={item.month} className="flex justify-between items-center text-sm">
                        <p className="text-muted-foreground">{item.month}</p>
                        <p className="font-semibold text-blue-500">{item.change}</p>
                    </div>
                ))}
                 <div className="flex justify-between items-center text-sm">
                     <p className="text-muted-foreground">Jun 2024</p>
                     <Avatar className="h-7 w-7">
                        <AvatarImage src={userAvatar} alt="User Avatar" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </div>
            </CardContent>
        </Card>
    )
}

function RiskMetricsCard() {
  const metrics = [
    { label: "Volatility", value: 70, level: "Medium", color: "bg-yellow-500" },
    { label: "Consistency", value: 85, level: "High", color: "bg-blue-500" },
    { label: "Risk Control", value: 95, level: "Excellent", color: "bg-green-500" },
  ];

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base font-bold">Risk Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {metrics.map(metric => (
          <div key={metric.label}>
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-sm font-medium">{metric.label}</p>
              <p className="text-sm text-muted-foreground">{metric.level}</p>
            </div>
            <Progress value={metric.value} indicatorClassName={metric.color} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PerformanceStats() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 shadow-sm h-32">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <p className="text-xl font-bold">+156%</p>
                <p className="text-xs text-muted-foreground">Total Return</p>
            </Card>
            <Card className="rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 shadow-sm h-32">
                <BarChartHorizontal className="w-8 h-8 text-blue-500" />
                <p className="text-xl font-bold">2.14</p>
                <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
            </Card>
        </div>
    )
}

export default function TraderProfile({ trader: initialTrader }: { trader: Trader }) {
    const router = useRouter();
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [tradeHistory, setTradeHistory] = useState<ClosedSignal[]>([]);
    const [visibleTradesCount, setVisibleTradesCount] = useState(INITIAL_TRADES_TO_SHOW);
    const [maxDrawdown, setMaxDrawdown] = useState('0.00%');
    const [sharpeRatio, setSharpeRatio] = useState<string | number>('N/A');
    const [avgHoldTime, setAvgHoldTime] = useState('N/A');
    const [totalTrades, setTotalTrades] = useState(0);
    const [trader, setTrader] = useState(initialTrader);
    const [visibilitySettings, setVisibilitySettings] = useState<ProfileVisibilitySettings | null>(null);


    useEffect(() => {
        const storedUsername = localStorage.getItem(USERNAME_KEY);
        const currentUserId = storedUsername ? storedUsername.toLowerCase().replace(/\s+/g, '-') : '';
        const isOwn = currentUserId === initialTrader.id;
        setIsOwnProfile(isOwn);

        // For this demo, we assume the visibility settings are the current user's own settings.
        // In a real app, you'd fetch the settings for the `initialTrader.id`.
        const storedVisibilitySettings = localStorage.getItem(PROFILE_VISIBILITY_KEY);
        if (storedVisibilitySettings) {
            setVisibilitySettings(JSON.parse(storedVisibilitySettings));
        } else {
             // Default settings if none are found
            setVisibilitySettings({
                username: initialTrader.name,
                location: initialTrader.location,
                specialties: initialTrader.specialties.join(', '),
                winRateVisible: true,
                pnlVisible: true,
                aumVisible: true,
            });
        }


        const storedTotalTrades = localStorage.getItem(STATS_TOTAL_TRADES_KEY);
        setTotalTrades(storedTotalTrades ? parseInt(storedTotalTrades, 10) : 0);

        // Update trader data with latest from localStorage
        const updatedTrader = getTraderDataById(initialTrader.id);
        setTrader(updatedTrader);

        const allHistoryRaw = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (allHistoryRaw) {
            try {
                const allHistory: ClosedSignal[] = JSON.parse(allHistoryRaw);
                setTradeHistory(allHistory);
                
                let peak = INITIAL_PORTFOLIO_VALUE;
                let maxDrawdownValue = 0;
                let currentBalance = INITIAL_PORTFOLIO_VALUE;

                const sortedHistory = [...allHistory].sort((a, b) => 
                    new Date(a.closeTimestamp).getTime() - new Date(b.closeTimestamp).getTime()
                );

                for (const trade of sortedHistory) {
                    currentBalance += trade.pnl;
                    if (currentBalance > peak) {
                        peak = currentBalance;
                    }
                    const drawdown = (peak - currentBalance) / peak;
                    if (drawdown > maxDrawdownValue) {
                        maxDrawdownValue = drawdown;
                    }
                }
                setMaxDrawdown(`${(maxDrawdownValue * 100).toFixed(2)}%`);

                if (allHistory.length > 1) {
                    const returns = allHistory.map(trade => trade.roe);
                    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
                    const stdDev = Math.sqrt(
                        returns.map(x => Math.pow(x - meanReturn, 2)).reduce((a, b) => a + b) / returns.length
                    );
                    const riskFreeRate = 0;
                    
                    if (stdDev > 0) {
                        const ratio = (meanReturn - riskFreeRate) / stdDev;
                        setSharpeRatio(ratio.toFixed(2));
                    } else {
                        setSharpeRatio('N/A');
                    }
                } else {
                    setSharpeRatio('N/A');
                }

                if (allHistory.length > 0) {
                    const totalDuration = allHistory.reduce((acc, trade) => {
                        const openTime = new Date(trade.openTimestamp).getTime();
                        const closeTime = new Date(trade.closeTimestamp).getTime();
                        if (!isNaN(openTime) && !isNaN(closeTime)) {
                            return acc + (closeTime - openTime);
                        }
                        return acc;
                    }, 0);
                    const avgDurationMs = totalDuration / allHistory.length;
                    
                    const days = avgDurationMs / (1000 * 60 * 60 * 24);
                    const hours = (avgDurationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
                    const minutes = (avgDurationMs % (1000 * 60 * 60)) / (1000 * 60);

                    if (days >= 1) {
                        setAvgHoldTime(`\'\'\'${days.toFixed(1)} days`);
                    } else if (hours >= 1) {
                        setAvgHoldTime(`\'\'\'${hours.toFixed(1)} hours`);
                    } else {
                        setAvgHoldTime(`\'\'\'${minutes.toFixed(0)} minutes`);
                    }
                } else {
                    setAvgHoldTime('N/A');
                }
            } catch (e) {
                console.error("Failed to parse trade history", e);
            }
        }
    }, [initialTrader.id, initialTrader.name, initialTrader.location, initialTrader.specialties]);

    const handleShowMore = () => {
        setVisibleTradesCount(prev => prev + 5);
    };

    const visibleTrades = tradeHistory.slice(0, visibleTradesCount);

    const winRate = useMemo(() => {
        if (tradeHistory.length === 0) return 'N/A';
        const wins = tradeHistory.filter(trade => trade.pnl >= 0).length;
        return `\'\'\'${((wins / tradeHistory.length) * 100).toFixed(1)}%`;
    }, [tradeHistory]);

  return (
    <div className="flex-grow flex flex-col min-h-0">
        <AppHeader showBackButton={true} />

        <main className="flex-grow overflow-y-auto px-4 pb-4">
            <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 text-3xl mb-4 border-4 border-secondary">
                    <AvatarImage src={trader.avatar} alt={trader.name} data-ai-hint={trader.dataAiHint}/>
                    <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{trader.name}</h2>
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex items-center gap-4 text-muted-foreground text-sm mt-2">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4"/>
                        <span>{trader.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4"/>
                        <span>Since {trader.memberSince}</span>
                    </div>
                </div>
                 <div className="flex gap-2 mt-4">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">{trader.riskLevel}</Badge>
                    <Badge variant="secondary">Swing Trading</Badge>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
                <StatCard icon={<TrendingUp className="w-8 h-8"/>} value={trader.monthlyReturn} label="Monthly Return" isPrivate={!visibilitySettings?.pnlVisible && !isOwnProfile} />
                <StatCard icon={<Target className="w-8 h-8"/>} value={winRate} label="Win Rate" isPrivate={!visibilitySettings?.winRateVisible && !isOwnProfile}/>
                <StatCard icon={<Users className="w-8 h-8"/>} value={trader.copiers} label="Active Copiers"/>
                <StatCard icon={<DollarSign className="w-8 h-8"/>} value={trader.aum} label="Assets Under Mgmt" isPrivate={!visibilitySettings?.aumVisible && !isOwnProfile} />
            </div>

             <Tabs defaultValue="overview" className="w-full mt-6">
                <TabsList className="bg-transparent p-0 h-auto">
                    <TabsTrigger value="overview" className="header-tabs-trigger">Overview</TabsTrigger>
                    <TabsTrigger value="trades" className="header-tabs-trigger">Trades</TabsTrigger>
                    <TabsTrigger value="performance" className="header-tabs-trigger">Performance</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4 space-y-4">
                     <Card className="rounded-2xl">
                        <CardContent className="p-4">
                           <h3 className="font-bold mb-4">Trading Statistics</h3>
                           <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-muted-foreground">Total Trades</TableCell>
                                    <TableCell className="text-right font-semibold">{totalTrades}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-muted-foreground">Avg Hold Time</TableCell>
                                    <TableCell className="text-right font-semibold">{avgHoldTime}</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="text-muted-foreground">Max Drawdown</TableCell>
                                    <TableCell className="text-right font-semibold text-red-500">{maxDrawdown}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-muted-foreground">Sharpe Ratio</TableCell>
                                    <TableCell className="text-right font-semibold">{sharpeRatio}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-muted-foreground">Current Streak</TableCell>
                                    <TableCell className="text-right font-semibold text-blue-500">{trader.tradingStreak}</TableCell>
                                </TableRow>
                            </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl">
                        <CardContent className="p-4">
                            <h3 className="font-bold mb-4">Specialties</h3>
                            <div className="flex flex-wrap gap-2">
                                {trader.specialties.map(spec => <Badge key={spec} variant="outline">{spec}</Badge>)}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="trades" className="mt-4 space-y-4">
                   {visibleTrades.length > 0 ? (
                        visibleTrades.map((signal) => (
                           <TradeHistoryCard key={signal.id} signal={signal} />
                        ))
                    ) : (
                        <Card className="rounded-2xl p-6 text-center text-muted-foreground">
                            This trader has no closed trades yet.
                        </Card>
                    )}
                   {tradeHistory.length > visibleTradesCount && (
                        <Button variant="outline" className="w-full" onClick={handleShowMore}>
                           <Eye className="w-4 h-4 mr-2" />
                           Show More
                       </Button>
                   )}
                </TabsContent>
                 <TabsContent value="performance" className="mt-4 space-y-4">
                    <MonthlyPerformanceCard />
                    <RiskMetricsCard />
                    <PerformanceStats />
                </TabsContent>
            </Tabs>

             {!isOwnProfile && (
                <div className="space-y-2 mt-6">
                    <Button className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold text-base">
                        <Copy className="w-5 h-5 mr-2" />
                        Start Copying This Trader
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 h-12">
                            <UserPlus className="w-5 h-5 mr-2" />
                            Follow
                        </Button>
                    </div>
                </div>
            )}

        </main>
    </div>
  )
}
