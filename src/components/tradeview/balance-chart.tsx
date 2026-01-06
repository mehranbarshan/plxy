

"use client"

import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts';
import { format, startOfDay, subDays, isWithinInterval, startOfWeek, startOfMonth, startOfYear, subMonths } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';
import type { ClosedSignal } from '@/lib/types';

const FUTURES_BALANCE_KEY = 'tradeview_demo_balance';
const SPOT_BALANCE_KEY = 'tradeview_spot_balance';
const HISTORY_STORAGE_KEY = 'tradeview_signal_history';
const INITIAL_TOTAL_BALANCE = 15000; // 10000 Futures + 5000 Spot

type Timeframe = 'Today' | 'Week' | 'Month' | 'Year';

const generateChartData = (livePnl: number, timeframe: Timeframe): { date: string; balance: number }[] => {
    let history: ClosedSignal[] = [];
    if (typeof window !== 'undefined') {
        try {
            const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
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
    
    // Calculate initial balance at the start of the timeframe
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
        // For 'Today', plot each trade as a point
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
        // For other timeframes, aggregate daily
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


    // Always add the current live point
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


export default function BalanceChart({ livePnl, timeframe }: { livePnl: number; timeframe: Timeframe; }) {
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
          formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Balance']}
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
