
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

interface GlobalData {
  data: {
    active_cryptocurrencies: number;
    total_volume: { [key: string]: number };
    market_cap_percentage: { [key: string]: number };
  };
}

interface FearAndGreedData {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update?: string;
}

const MarketStatCard = ({ title, value, subtitle, valueColor, subtitleColor }: { title: string, value: string | React.ReactNode, subtitle: string, valueColor?: string, subtitleColor?: string }) => (
    <Card className="flex-1 text-center p-2 rounded-xl shadow-sm">
        <CardContent className="p-0 flex flex-col justify-center h-full">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className={`text-base font-bold ${valueColor || ''}`}>{value}</p>
            <p className={`text-xs ${subtitleColor || 'text-muted-foreground'}`}>{subtitle}</p>
        </CardContent>
    </Card>
);

const LoadingSkeleton = () => (
    <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
             <Card key={i} className="flex-1 text-center p-2 rounded-xl shadow-sm">
                 <CardContent className="p-0 space-y-1">
                    <Skeleton className="h-3 w-10/12 mx-auto" />
                    <Skeleton className="h-4 w-8/12 mx-auto" />
                    <Skeleton className="h-3 w-9/12 mx-auto" />
                </CardContent>
             </Card>
        ))}
    </div>
);


export default function MarketStats() {
    const [globalData, setGlobalData] = useState<GlobalData['data'] | null>(null);
    const [fearAndGreed, setFearAndGreed] = useState<FearAndGreedData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMarketData() {
            try {
                const [globalRes, fearAndGreedRes] = await Promise.all([
                    fetch('/api/global'),
                    fetch('/api/fear-and-greed'),
                ]);

                if (globalRes.ok) {
                    const globalJson: GlobalData = await globalRes.json();
                    setGlobalData(globalJson.data);
                } else {
                     console.error('Failed to fetch global data');
                }

                if (fearAndGreedRes.ok) {
                    const fearAndGreedJson = await fearAndGreedRes.json();
                    setFearAndGreed(fearAndGreedJson);
                } else {
                    console.error('Failed to fetch fear and greed data');
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchMarketData();
    }, []);

    const getFearGreedColor = (rating: string) => {
        const lowerCaseRating = rating.toLowerCase();
        if (lowerCaseRating.includes('extreme fear')) return 'text-red-700';
        if (lowerCaseRating.includes('fear')) return 'text-red-500';
        if (lowerCaseRating.includes('neutral')) return 'text-yellow-600';
        if (lowerCaseRating.includes('greed')) return 'text-green-500';
        if (lowerCaseRating.includes('extreme greed')) return 'text-green-700';
        return '';
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    const stats = [
        { 
            title: 'Fear & Greed', 
            value: fearAndGreed?.value || 'N/A',
            subtitle: fearAndGreed?.value_classification || 'N/A',
            valueColor: getFearGreedColor(fearAndGreed?.value_classification || '')
        },
        { 
            title: 'BTC Dominance', 
            value: `${globalData?.market_cap_percentage?.btc?.toFixed(1)}%` || 'N/A', 
            subtitle: 'Dominance' 
        },
        { 
            title: '24h Volume', 
            value: `$${((globalData?.total_volume?.usd || 0) / 1e9).toFixed(1)}B` || 'N/A',
            subtitle: 'All Coins' 
        },
        { 
            title: 'Active Cryptos', 
            value: globalData?.active_cryptocurrencies?.toLocaleString() || 'N/A', 
            subtitle: 'Tracked' 
        },
    ];

    return (
        <div className="grid grid-cols-4 gap-2">
            {stats.map(stat => <MarketStatCard key={stat.title} {...stat} />)}
        </div>
    );
}
