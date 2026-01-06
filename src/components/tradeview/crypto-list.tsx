
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flame, Star, TrendingUp, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export interface CryptoListData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  binanceSymbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

const FAVORITES_KEY = 'tradeview_favorites';

const CryptoListItem = ({ crypto, rank, isFavoriteItem, onFavoriteRemove }: { crypto: CryptoListData, rank: number, isFavoriteItem?: boolean, onFavoriteRemove?: (id: string) => void }) => {
  const priceChange = parseFloat(crypto.priceChangePercent);
  const isPositive = priceChange >= 0;
  const baseAsset = crypto.symbol.toUpperCase();

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteRemove) {
        onFavoriteRemove(crypto.id);
    }
  }

  return (
    <TableRow>
        <TableCell className="p-2 w-10 text-center text-muted-foreground text-xs">
            {isFavoriteItem ? (
                <button onClick={handleRemoveClick} className="flex items-center justify-center w-full h-full">
                    <Star className="w-4 h-4 mx-auto fill-yellow-400 text-yellow-400" />
                </button>
            ) : (
                rank
            )}
        </TableCell>
        <TableCell className="p-2">
            <Link href={`/coin/${crypto.id}?symbol=${crypto.binanceSymbol}`} className="flex items-center gap-2">
                <Image src={crypto.image} alt={crypto.name} width={24} height={24} className="rounded-full" />
                <span className="font-bold text-sm">{baseAsset}</span>
            </Link>
        </TableCell>
        <TableCell className="p-2 text-right font-semibold text-sm">${parseFloat(crypto.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</TableCell>
        <TableCell className="p-2 text-right">
            <div className={cn(
                "inline-block px-2 py-1 rounded-md text-xs font-medium",
                isPositive ? "bg-green-100/60 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100/60 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            )}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
        </TableCell>
    </TableRow>
  );
};

const LoadingSkeleton = () => (
    <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-xl">
                <div className="flex items-center gap-3 w-1/3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="w-1/4">
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="w-1/4">
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        ))}
    </div>
);

export default function CryptoList() {
  const [allCryptos, setAllCryptos] = useState<CryptoListData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const { toast } = useToast();
  

  useEffect(() => {
    async function fetchCryptoData() {
      try {
        setLoading(true);
        const response = await fetch('/api/all-cryptos');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch crypto data');
        }
        const data: CryptoListData[] = await response.json();
        setAllCryptos(data);

        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (!storedFavorites || JSON.parse(storedFavorites).length === 0) {
            const top5Ids = data.slice(0, 5).map(c => c.id);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(top5Ids));
            setFavoriteIds(top5Ids);
        } else {
            setFavoriteIds(JSON.parse(storedFavorites));
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCryptoData();
  }, []);
  
  
  const trendingCryptos = useMemo(() => allCryptos.slice(0, 10), [allCryptos]);
  
  const favoriteCryptos = useMemo(() => {
      return allCryptos.filter(c => favoriteIds.includes(c.id));
  }, [favoriteIds, allCryptos]);
  
  const handleRemoveFavorite = (id: string) => {
    const newFavoriteIds = favoriteIds.filter(favId => favId !== id);
    setFavoriteIds(newFavoriteIds);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavoriteIds));
    const removedCoin = allCryptos.find(c => c.id === id);
    if(removedCoin) {
        toast({ title: `${removedCoin.name} removed from favorites.`});
    }
  }

  const renderCryptoTable = (data: CryptoListData[], isFavoritesTab = false) => {
      if (loading && data.length === 0) return <LoadingSkeleton />;
      if (error) return <p className="text-destructive text-center p-4">{error}</p>;
      if (data.length === 0) return <p className="text-muted-foreground text-center p-4 text-sm">No coins to display.</p>;
      
      return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="p-2 w-10 text-center text-xs">#</TableHead>
                    <TableHead className="p-2 text-xs">Coin</TableHead>
                    <TableHead className="p-2 text-right text-xs">Price</TableHead>
                    <TableHead className="p-2 text-right text-xs">24h %</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((crypto, index) => (
                    <CryptoListItem 
                        key={crypto.id} 
                        crypto={crypto} 
                        rank={index + 1}
                        isFavoriteItem={isFavoritesTab}
                        onFavoriteRemove={isFavoritesTab ? handleRemoveFavorite : undefined}
                    />
                ))}
            </TableBody>
        </Table>
      );
  }

  return (
    <Card className="bg-transparent shadow-none border-none">
      <CardHeader className="p-0 mb-4">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Crypto Watchlist</h2>
          <Link href="/market">
            <Button variant="link" className="text-primary">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="trending">
            <TabsList className="grid w-full grid-cols-2 bg-secondary rounded-xl p-1 h-auto mb-4">
                <TabsTrigger value="trending" className="gap-2 text-xs">
                    <TrendingUp className="w-4 h-4" />
                    Trending
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2 text-xs">
                    <Star className="w-4 h-4" />
                    Favorites
                </TabsTrigger>
            </TabsList>
            <TabsContent value="trending">
                {renderCryptoTable(trendingCryptos, false)}
            </TabsContent>
            <TabsContent value="favorites">
                 {renderCryptoTable(favoriteCryptos, true)}
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
