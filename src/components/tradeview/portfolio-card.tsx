

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
import { isWithinInterval, startOfDay, subDays, startOfMonth, startOfYear, endOfDay, subMonths } from 'date-fns';
import type { Signal, ClosedSignal } from "@/lib/types";
import type { MergedCoinData } from '@/types/coin-data';
import BalanceChart from '@/components/tradeview/balance-chart';

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
                    {balanceVisible ? `$${totalLiveBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '********'}
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
                {balanceVisible ? `${pnlIsPositive ? '+' : '-'}$${Math.abs(timeframePnl).toFixed(2)}` : '****'}
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
