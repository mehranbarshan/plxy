

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUp, ArrowDown, Star, ChevronDown, Search, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import TradingViewWidget from '@/components/tradeview/tradingview-widget';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import AllCryptosList from '@/components/tradeview/all-cryptos-list';
import { Input } from '@/components/ui/input';
import type { MergedCoinData } from '@/components/tradeview/all-cryptos-list';

interface CoinInfo extends MergedCoinData {
    highPrice?: string;
    lowPrice?: string;
    rank?: number;
}


const FAVORITES_KEY = 'tradeview_favorites';

const formatNumber = (numStr: string | number | null | undefined, precision = 2) => {
  if (numStr === null || numStr === undefined || isNaN(Number(numStr))) return 'N/A';
  const num = typeof numStr === 'string' ? parseFloat(numStr) : numStr;
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}`;
};

function CoinStatsGrid({ coin }: { coin: CoinInfo }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div className="text-right">
            <p className="text-muted-foreground">24h High</p>
            <p className="font-semibold">{formatNumber(coin.highPrice)}</p>
        </div>
        <div className="text-right">
            <p className="text-muted-foreground">24h Vol (USDT)</p>
            <p className="font-semibold">{formatNumber(coin.quoteVolume, 0)}</p>
        </div>
        <div className="text-right">
            <p className="text-muted-foreground">24h Low</p>
            <p className="font-semibold">{formatNumber(coin.lowPrice)}</p>
        </div>
        <div className="text-right">
            <p className="text-muted-foreground">Market Cap</p>
            <p className="font-semibold">{formatNumber(coin.marketCap, 0)}</p>
        </div>
    </div>
  );
}

function SearchSheet({ onCoinSelect }: { onCoinSelect: () => void }) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <SheetContent side="bottom" className="h-[95%] rounded-t-2xl flex flex-col p-0">
            <SheetHeader className="p-4 border-b flex-row items-center justify-between">
                <SheetTitle>Markets</SheetTitle>
                <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                        <X className="w-5 h-5" />
                    </Button>
                </SheetClose>
            </SheetHeader>
            <div className="flex-grow overflow-y-auto px-4 pt-4">
                <AllCryptosList 
                  searchQuery={searchQuery} 
                  onCoinSelect={onCoinSelect} 
                  onSearchChange={setSearchQuery} 
                />
            </div>
        </SheetContent>
    )
}

// Helper function to get initial coin data from our own API and CoinGecko
async function getInitialCoinData(id: string): Promise<CoinInfo | null> {
    try {
        const allCryptosResponse = await fetch('/api/all-cryptos');
        if (!allCryptosResponse.ok) return null;
        const allCoins: MergedCoinData[] = await allCryptosResponse.json();
        const coinFromList = allCoins.find(c => c.id === id);
        
        if (!coinFromList) return null;

        // Fetch detailed data from CoinGecko for high/low prices
        const apiKey = process.env.NEXT_PUBLIC_COINGECKO_DEMO_API_KEY;
        const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/${id}?x_cg_demo_api_key=${apiKey || ''}`;
        const coingeckoResponse = await fetch(coingeckoUrl);
        
        let highPrice, lowPrice;
        if(coingeckoResponse.ok) {
            const coingeckoData = await coingeckoResponse.json();
            highPrice = coingeckoData.market_data?.high_24h?.usd?.toString();
            lowPrice = coingeckoData.market_data?.low_24h?.usd?.toString();
        }

        return { 
            ...coinFromList, 
            highPrice: highPrice || coinFromList.lastPrice,
            lowPrice: lowPrice || coinFromList.lastPrice,
            rank: allCoins.findIndex(c => c.id === id) + 1,
        };
    } catch (error) {
        console.error("Failed to fetch initial coin data:", error);
        return null;
    }
}


function CoinDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = params.id as string;
  const binanceSymbol = searchParams.get('symbol') || '';

  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);
  const [loadingCoin, setLoadingCoin] = useState(true);
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  

  useEffect(() => {
    try {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
            const favorites: string[] = JSON.parse(storedFavorites);
            setIsFavorite(favorites.includes(id));
        }
    } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
    }
  }, [id]);

  const toggleFavorite = () => {
      try {
          const storedFavorites = localStorage.getItem(FAVORITES_KEY);
          let favorites: string[] = storedFavorites ? JSON.parse(storedFavorites) : [];
          
          if (isFavorite) {
              favorites = favorites.filter(favId => favId !== id);
              toast({ title: 'Removed from Favorites' });
          } else {
              favorites.push(id);
              toast({ title: 'Added to Favorites' });
          }
          
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
          setIsFavorite(!isFavorite);

      } catch(e) {
          console.error("Failed to save favorites to localStorage", e);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not update favorites.' });
      }
  }

  useEffect(() => {
    async function fetchCoinInfo() {
      if (!id) return;
      try {
        setLoadingCoin(true);
        const initialData = await getInitialCoinData(id);
        if (initialData) {
          setCoinInfo(initialData);
        } else {
           toast({ variant: 'destructive', title: 'Error', description: 'Coin not found.' });
           router.push('/telegram-channels');
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load coin data.' });
      } finally {
        setLoadingCoin(false);
      }
    }
    fetchCoinInfo();
  }, [id, router, toast]);

  const isPositive = coinInfo ? parseFloat(coinInfo.priceChangePercent) >= 0 : false;
  
  const handleTradeAction = (action: string) => {
    if (!coinInfo) {
      toast({ variant: 'destructive', title: 'Error', description: 'Coin data not loaded yet.' });
      return;
    }
  
    const queryParams = new URLSearchParams({
      symbol: coinInfo.binanceSymbol,
      price: coinInfo.lastPrice,
      image: coinInfo.image,
    });
  
    if (action === 'Trade') {
      queryParams.set('tab', 'futures');
      router.push(`/futures?${queryParams.toString()}`);
    } else if (action === 'Spot') {
      queryParams.set('tab', 'spot');
      router.push(`/spot?${queryParams.toString()}`);
    } else {
      toast({ title: "Action Demo", description: `The "${action}" action is for demonstration.` });
    }
  };


  return (
    <Sheet open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen}>
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="p-4 flex items-center gap-4 container mx-auto max-w-2xl sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {loadingCoin ? (
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        ) : coinInfo && (
          <div className="flex items-center justify-between w-full">
            <SheetTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer">
                   <Image src={coinInfo.image} alt={coinInfo.name} width={32} height={32} />
                   <div>
                      <div className="flex items-center gap-2">
                         <h1 className="text-lg font-bold">{coinInfo.symbol.toUpperCase()}</h1>
                         {coinInfo.rank && <Badge variant="secondary">#{coinInfo.rank}</Badge>}
                         <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                   </div>
                </div>
            </SheetTrigger>
            <Button variant="ghost" size="icon" onClick={toggleFavorite}>
                <Star className={cn("w-5 h-5 text-muted-foreground", isFavorite && "fill-yellow-400 text-yellow-400")} />
            </Button>
          </div>
        )}
      </header>

      <main className="flex-grow container mx-auto max-w-2xl px-4 pb-24 space-y-6">
        <Card className="rounded-2xl border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
             {loadingCoin ? (
                <div className="space-y-2 w-full">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-5 w-20" />
                </div>
             ) : coinInfo && (
                <>
                <div className="w-full md:w-auto">
                  <p className="text-3xl font-bold">${parseFloat(coinInfo.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
                  <div className={cn("flex items-center gap-1 text-sm font-semibold", isPositive ? 'text-green-500' : 'text-red-500')}>
                    {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{parseFloat(coinInfo.priceChangePercent).toFixed(2)}% (24h)</span>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                   <CoinStatsGrid coin={coinInfo} />
                </div>
                </>
             )}
          </CardContent>
        </Card>

        <div className="h-[400px]">
          {loadingCoin ? (
            <Skeleton className="w-full h-full rounded-2xl" />
          ) : coinInfo && (
            <TradingViewWidget symbol={`BINANCE:${coinInfo.binanceSymbol}`} />
          )}
        </div>

      </main>

       <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 border-t">
          <div className="container mx-auto max-w-2xl px-0">
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleTradeAction('Spot')}>Spot</Button>
                <Button variant="ghost" size="icon" onClick={() => handleTradeAction('Set Alert')}>
                    <Bell className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button size="lg" className="h-12 flex-grow font-bold" onClick={() => handleTradeAction('Trade')}>Trade</Button>
            </div>
          </div>
       </div>
    </div>
    <SearchSheet onCoinSelect={() => setIsSearchSheetOpen(false)} />
    </Sheet>
  );
}

export default function CoinDetailPage() {
    return (
        <Suspense fallback={<CoinDetailSkeleton />}>
            <CoinDetailContent />
        </Suspense>
    )
}

function CoinDetailSkeleton() {
    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className="p-4 flex items-center gap-4 container mx-auto max-w-2xl sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </div>
            </header>
            <main className="flex-grow container mx-auto max-w-2xl px-4 pb-24 space-y-6">
                 <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-2 w-1/2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
                <Skeleton className="w-full h-[400px] rounded-2xl" />
                <Skeleton className="w-full h-20 rounded-2xl" />
            </main>
            <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 border-t">
                <div className="container mx-auto max-w-2xl px-0">
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
