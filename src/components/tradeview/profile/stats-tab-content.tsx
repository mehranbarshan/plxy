
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Flame, Target, TrendingUp, Percent, BarChart } from 'lucide-react';
import ProfileStatCard from '../profile-stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function TargetSuccessRatesCard() {
  const rates = [
    { label: 'TP1 Success Rate', value: 85.2, colorClass: 'text-blue-500', bgClass: 'bg-blue-500' },
    { label: 'TP2 Success Rate', value: 67.8, colorClass: 'text-blue-500', bgClass: 'bg-blue-500' },
    { label: 'TP3 Success Rate', value: 45.1, colorClass: 'text-blue-500', bgClass: 'bg-blue-500' },
    { label: 'Stop Loss Rate', value: 26.5, colorClass: 'text-purple-500', bgClass: 'bg-purple-500' },
  ];

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Target Success Rates</CardTitle>
        <CardDescription className="text-xs">How often your take profit and stop loss levels are hit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rates.map((rate) => (
          <div key={rate.label}>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-muted-foreground">{rate.label}</span>
              <span className={cn("font-semibold", rate.colorClass)}>{rate.value}%</span>
            </div>
            <Progress value={rate.value} indicatorClassName={rate.bgClass} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


function WinRateOverallCard() {
    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Percent className="w-5 h-5 text-muted-foreground" />
                    Win Rate Overall
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-4xl font-bold text-primary">73.5%</p>
                <p className="text-xs text-muted-foreground">out of 127 trades</p>
            </CardContent>
        </Card>
    );
}

function TotalPLCard() {
    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    Total P&L
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-4xl font-bold text-green-500">+$4,230.75</p>
                <p className="text-xs text-muted-foreground">All time profit and loss</p>
            </CardContent>
        </Card>
    )
}

function ProfitLossRatioCard() {
    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart className="w-5 h-5 text-muted-foreground" />
                    Profit & Loss Ratio
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg. Profit</span>
                    <span className="text-sm font-semibold text-green-500">+$125.50</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg. Loss</span>
                    <span className="text-sm font-semibold text-red-500">-$45.20</span>
                </div>
                <div className="text-center pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Ratio</p>
                    <p className="text-2xl font-bold text-primary">2.78</p>
                </div>
            </CardContent>
        </Card>
    );
}


export default function StatsTabContent() {
  return (
    <div className="space-y-6 mt-6">
        <Tabs defaultValue="win-rate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary rounded-xl p-1 h-auto">
            <TabsTrigger value="win-rate" className="text-xs px-2 py-1.5">Win Rate</TabsTrigger>
            <TabsTrigger value="p-l" className="text-xs px-2 py-1.5">P&L</TabsTrigger>
          </TabsList>
          <TabsContent value="win-rate" className="mt-6 space-y-6">
            <WinRateOverallCard />
            <TargetSuccessRatesCard />
          </TabsContent>
          <TabsContent value="p-l" className="mt-6 space-y-6">
            <TotalPLCard />
            <ProfitLossRatioCard />
          </TabsContent>
        </Tabs>
      
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle className="text-base">Trading Performance</CardTitle>
                <CardDescription className="text-xs">Detailed breakdown of your trading statistics</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-muted-foreground">Total Trades</p>
                    <p className="text-lg font-bold">127</p>
                </div>
                 <div>
                    <p className="text-xs text-muted-foreground">Trading Streak</p>
                    <p className="text-lg font-bold flex items-center gap-1">
                        <Flame className="w-5 h-5 text-orange-500" />
                        12 days
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
