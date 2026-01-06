
"use client"
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  subMonths, 
  isWithinInterval,
  format
} from "date-fns";


import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, TrendingUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Signal, ClosedSignal } from "@/lib/types";
import type { MergedCoinData } from '@/types/coin-data';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts';

const FUTURES_BALANCE_KEY = 'tradeview_demo_balance';
const SPOT_BALANCE_KEY = 'tradeview_spot_balance';
const SIGNALS_KEY = 'tradeview_my_signals';
const HISTORY_KEY = 'tradeview_signal_history';

type Timeframe = 'Today' | 'Week' | 'Month' | 'Year';

interface PortfolioCardProps {
  count: number;
  current: number;
  scrollTo: (index: number) => void;
}

const INITIAL_TOTAL_BALANCE = 15000;

const generateChartData = (livePnl: number, timeframe: Timeframe): { date: string; balance: number }[] => {
    let history: ClosedSignal[] = [];
    if (typeof window !== 'undefined') {
        try {
            const storedHistory = localStorage.getItem(HISTORY_KEY);
            if (storedHistory) {
                history = JSON.parse(storedHistory);
            }
        } catch (e) {
            console.error("Failed to parse history from localStorage", e);
        }
    }

    const sortedHistory = history
        .filter(trade => trade.closeTimestamp && !isNaN(new Date(trade.closeTimestamp).getTime()))
        .sort((a, b) => new Date(a.closeTimestamp).getTime() - new Date(b.closeTimestamp).getTime());

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
        case 'Today': startDate = startOfDay(now); break;
        case 'Week': startDate = subDays(now, 7); break;
        case 'Month': startDate = subDays(now, 28); break;
        case 'Year': startDate = subMonths(now, 12); break;
        default: startDate = startOfDay(now);
    }
    
    const balanceBeforeTimeframe = sortedHistory
        .filter(trade => new Date(trade.closeTimestamp) < startDate)
        .reduce((sum, trade) => sum + trade.pnl, INITIAL_TOTAL_BALANCE);

    const data: { date: string; balance: number }[] = [];
    data.push({
        date: startDate.toISOString(),
        balance: balanceBeforeTimeframe
    });

    let runningBalance = balanceBeforeTimeframe;

    const tradesInTimeframe = sortedHistory.filter(trade => new Date(trade.closeTimestamp) >= startDate);
    
    if (timeframe === 'Today') {
        tradesInTimeframe.forEach(trade => {
            const ts = new Date(trade.closeTimestamp);
            if (!isNaN(ts.getTime())) {
                runningBalance += trade.pnl;
                data.push({
                    date: ts.toISOString(),
                    balance: runningBalance,
                });
            }
        });
    } else {
        const dailyAggregates = new Map<string, number>();

        tradesInTimeframe.forEach(trade => {
            const dayKey = startOfDay(new Date(trade.closeTimestamp)).toISOString();
            const currentPnl = dailyAggregates.get(dayKey) || 0;
            dailyAggregates.set(dayKey, currentPnl + trade.pnl);
        });

        const sortedDays = Array.from(dailyAggregates.keys()).sort();
        
        let dailyRunningBalance = balanceBeforeTimeframe;
        sortedDays.forEach(day => {
            dailyRunningBalance += dailyAggregates.get(day) || 0;
            data.push({
                date: day,
                balance: dailyRunningBalance
            });
        });
        runningBalance = dailyRunningBalance;
    }

    const futuresBalanceStr = typeof window !== 'undefined' ? localStorage.getItem(FUTURES_BALANCE_KEY) : '10000';
    const spotBalanceStr = typeof window !== 'undefined' ? localStorage.getItem(SPOT_BALANCE_KEY) : '5000';
    const futuresBalance = futuresBalanceStr ? parseFloat(futuresBalanceStr) : 10000;
    const spotBalance = spotBalanceStr ? parseFloat(spotBalanceStr) : 5000;
    const currentStaticBalance = futuresBalance + spotBalance;

    data.push({
        date: new Date().toISOString(),
        balance: currentStaticBalance + livePnl,
    });


    return data;
};

function BalanceChart({ livePnl, timeframe }: { livePnl: number; timeframe: Timeframe; }) {
  const [chartData, setChartData] = useState<{ date: string; balance: number }[]>([]);
  
  useEffect(() => {
    const data = generateChartData(livePnl, timeframe);
    setChartData(data);
    
    const handleStorageChange = () => {
        const newData = generateChartData(livePnl, timeframe);
        setChartData(newData);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('balanceUpdated', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('balanceUpdated', handleStorageChange);
    };

  }, [livePnl, timeframe]);


  if (chartData.length === 0) {
    return null; 
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: -10,
        }}
      >
        <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(255, 255, 255, 0.4)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="rgba(255, 255, 255, 0)" stopOpacity={0}/>
            </linearGradient>
        </defs>
        
        <XAxis dataKey="date" hide={true} />
        
        <Tooltip
          cursor={{ stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 1, strokeDasharray: '3 3' }}
          contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '12px',
              padding: '5px 10px',
          }}
          labelFormatter={(label) => {
              if (!label) return '';
              try {
                return new Date(label).toLocaleString();
              } catch (e) {
                return '';
              }
          }}
          formatter={(value: number) => [`$${'\'\'\''}${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Balance']}
        />

        <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="rgba(255, 255, 255, 0.8)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorBalance)" 
            dot={false}
            name="Balance"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}


export default function PortfolioCard({ count, current, scrollTo }: PortfolioCardProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [staticBalance, setStaticBalance] = useState<number | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [allCryptos, setAllCryptos] = useState<MergedCoinData[]>([]);
  const [history, setHistory] = useState<ClosedSignal[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('Today');

  useEffect(() => {
    const fetchInitialData = () => {
      const storedFuturesBalance = localStorage.getItem(FUTURES_BALANCE_KEY);
      const storedSpotBalance = localStorage.getItem(SPOT_BALANCE_KEY);
      const futuresBalance = storedFuturesBalance ? parseFloat(storedFuturesBalance) : 10000;
      const spotBalance = storedSpotBalance ? parseFloat(storedSpotBalance) : 5000;
      setStaticBalance(futuresBalance + spotBalance);

      const storedSignals = localStorage.getItem(SIGNALS_KEY);
      setSignals(storedSignals ? JSON.parse(storedSignals) : []);

      const storedHistory = localStorage.getItem(HISTORY_KEY);
      setHistory(storedHistory ? JSON.parse(storedHistory) : []);
    };
    
    fetchInitialData();

    const handleStorageChange = (e: StorageEvent) => {
      if ([FUTURES_BALANCE_KEY, SPOT_BALANCE_KEY, SIGNALS_KEY, HISTORY_KEY].includes(e.key || '')) {
        fetchInitialData();
      }
    };
    
    const handleBalanceUpdate = () => {
        fetchInitialData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('balanceUpdated', handleBalanceUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/all-cryptos');
        if (response.ok) {
          const data: MergedCoinData[] = await response.json();
          setAllCryptos(data);
        } else {
          console.error('Failed to fetch crypto prices for P&L calculation.');
        }
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 3600); // Poll every 3.6 seconds for live prices
    return () => clearInterval(interval);
  }, []);

  const livePnl = useMemo(() => {
    if (!signals.length || !allCryptos.length) return 0;
    
    const priceMap = new Map(allCryptos.map(crypto => [crypto.binanceSymbol, parseFloat(crypto.lastPrice)]));

    return signals.reduce((totalPnl, signal) => {
      const markPrice = priceMap.get(signal.ticker);
      if (!markPrice || signal.positionMode !== 'futures') return totalPnl;

      const { tradeType, margin, entryPrice, leverage } = signal;
      const positionSize = margin * leverage;
      const sizeInAsset = entryPrice > 0 ? positionSize / entryPrice : 0;
      
      let pnl = 0;
      if (tradeType === 'Long') {
        pnl = (markPrice - entryPrice) * sizeInAsset;
      } else {
        pnl = (entryPrice - markPrice) * sizeInAsset;
      }
      return totalPnl + pnl;
    }, 0);
  }, [signals, allCryptos]);
  
  const timeframePnl = useMemo(() => {
    const now = new Date();
    let interval;

    switch(timeframe) {
      case 'Today':
        interval = { start: startOfDay(now), end: endOfDay(now) };
        break;
      case 'Week':
        interval = { start: subDays(now, 7), end: now };
        break;
      case 'Month':
        interval = { start: subDays(now, 28), end: now };
        break;
      case 'Year':
        interval = { start: subMonths(now, 12), end: now };
        break;
    }

    const closedPnlInTimeframe = history
      .filter(trade => {
        try {
          if (!trade.closeTimestamp) return false;
          const closeDate = new Date(trade.closeTimestamp);
          return isWithinInterval(closeDate, interval);
        } catch(e) {
          return false;
        }
      })
      .reduce((sum, trade) => sum + trade.pnl, 0);

    return closedPnlInTimeframe + livePnl;
  }, [timeframe, history, livePnl]);


  const totalLiveBalance = staticBalance !== null ? staticBalance + livePnl : null;
  
  const toggleVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };
  
  const pnlIsPositive = timeframePnl >= 0;

  return (
    <Card className="w-full bg-gradient-to-br from-primary to-purple-500 text-primary-foreground rounded-2xl shadow-lg h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
              <span>Total Balance</span>
              <Button variant="ghost" size="icon" className="w-6 h-6 text-primary-foreground/80 hover:text-primary-foreground" onClick={toggleVisibility}>
                {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {totalLiveBalance === null ? (
                 <div className="h-9 w-48 mt-1 bg-white/20 animate-pulse rounded-md" />
            ) : (
                <p className="text-3xl font-bold">
                    {balanceVisible ? `$${'\'\'\''}${totalLiveBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '********'}
                </p>
            )}
          </div>
          <div className="text-right">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 text-sm text-primary-foreground/80 h-auto p-0 hover:bg-transparent">
                      {timeframe}'s P&L
                      <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/80 backdrop-blur-sm text-foreground">
                  <DropdownMenuItem onClick={() => setTimeframe('Today')}>Today</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeframe('Week')}>Week</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeframe('Month')}>Month</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeframe('Year')}>Year</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className={cn("text-lg font-semibold", pnlIsPositive ? 'text-green-300' : 'text-red-300')}>
                {balanceVisible ? `${pnlIsPositive ? '+' : '-'}$${'\'\'\''}${Math.abs(timeframePnl).toFixed(2)}` : '****'}
              </p>
          </div>
        </div>
        <div className="flex-grow my-4 -mx-6">
            <BalanceChart livePnl={livePnl} timeframe={timeframe} />
        </div>
         <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all bg-white/50",
                current === index ? "w-4 bg-white" : "hover:bg-white/75"
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
