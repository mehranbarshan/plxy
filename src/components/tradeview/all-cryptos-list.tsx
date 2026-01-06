
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';

export interface MergedCoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  binanceSymbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
  marketCap: number;
}


const formatNumber = (numStr: string | number | null | undefined) => {
  if (numStr === null || numStr === undefined || isNaN(Number(numStr))) return 'N/A';
  const num = typeof numStr === 'string' ? parseFloat(numStr) : numStr;

  if (num >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`;
  }
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  }
  if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  }
  if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  }
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const CryptoListItem = ({ crypto, rank, activeSortKey, onCoinSelect }: { crypto: MergedCoinData, rank: number, activeSortKey: string, onCoinSelect?: () => void }) => {
  const router = useRouter();
  const priceChange = parseFloat(crypto.priceChangePercent);
  const isPositive = priceChange >= 0;
  const baseAsset = crypto.binanceSymbol.toUpperCase().replace(/USDT$/, '');


  const handleSelect = () => {
    router.push(`/coin/${crypto.id}?symbol=${crypto.binanceSymbol}`);
    if (onCoinSelect) {
        onCoinSelect();
    }
  }

  const renderDynamicColumn = () => {
    switch(activeSortKey) {
        case 'marketCap':
            return <span className="text-sm text-muted-foreground">{formatNumber(crypto.marketCap)}</span>;
        case 'quoteVolume':
            return <span className="text-sm text-muted-foreground">{formatNumber(crypto.quoteVolume)}</span>;
        case 'priceChangePercent':
        default:
            return (
                <div className={cn(
                    "inline-block px-2 py-1 rounded-md text-xs",
                    isPositive ? "bg-green-100/60 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100/60 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                )}>
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </div>
            );
    }
  }

  return (
     <TableRow onClick={handleSelect} className="cursor-pointer">
        <TableCell className="p-2 w-10 text-center text-muted-foreground text-xs">{rank}</TableCell>
        <TableCell className="p-2">
           <div className="flex items-center gap-2">
                <Image src={crypto.image} alt={crypto.name} width={24} height={24} className="rounded-full" />
                <span className="font-bold text-sm">{baseAsset}</span>
            </div>
        </TableCell>
        <TableCell className="p-2 text-right font-semibold text-sm">${parseFloat(crypto.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</TableCell>
        <TableCell className="p-2 text-right text-sm font-medium">
            {renderDynamicColumn()}
        </TableCell>
    </TableRow>
  );
};

const LoadingSkeleton = () => (
    <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
             <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-3 w-1/4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                 <div className="w-1/5">
                    <Skeleton className="h-4 w-full" />
                </div>
                 <div className="w-1/6">
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="w-1/4">
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        ))}
    </div>
)


type SortKey = 'marketCap' | 'quoteVolume' | 'priceChangePercent';
type SortDirection = 'asc' | 'desc';

interface AllCryptosListProps {
    searchQuery: string;
    onCoinSelect?: () => void;
    sortKey?: SortKey;
    sortDirection?: SortDirection;
    onSearchChange?: (query: string) => void;
}

export default function AllCryptosList({ 
  searchQuery, 
  onCoinSelect, 
  sortKey = 'marketCap', 
  sortDirection = 'desc',
  onSearchChange 
}: AllCryptosListProps) {
  const [cryptos, setCryptos] = useState<MergedCoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);
  
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const response = await fetch('/api/all-cryptos');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch crypto data');
        }
        const data: MergedCoinData[] = await response.json();
        setCryptos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchInitialData();
  }, []);


  const sortedCryptos = useMemo(() => {
    const filtered = cryptos.filter(crypto => {
        if (!crypto) return false;
        const query = searchQuery.toLowerCase();
        const nameMatch = crypto.name && crypto.name.toLowerCase().includes(query);
        const symbolMatch = crypto.symbol && crypto.symbol.toLowerCase().includes(query);
        return nameMatch || symbolMatch;
    });

    return [...filtered].sort((a, b) => {
        if (sortKey === 'marketCap' || sortKey === 'quoteVolume' || sortKey === 'priceChangePercent') {
            const aValue = parseFloat(a[sortKey]?.toString() ?? '0');
            const bValue = parseFloat(b[sortKey]?.toString() ?? '0');
            return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
        }
        return 0;
    });
  }, [cryptos, searchQuery, sortKey, sortDirection]);
  
  const visibleCryptos = sortedCryptos.slice(0, visibleCount);
  
  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + 50);
  }

  const getDynamicHeader = () => {
    switch(sortKey) {
        case 'marketCap': return 'Market Cap';
        case 'quoteVolume': return 'Volume (24h)';
        case 'priceChangePercent':
        default:
            return '24h %';
    }
  }

  return (
    <div className="space-y-4">
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search coins..."
            className="pl-10 bg-secondary border-none"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      <Card className="bg-transparent shadow-none border-none">
        <CardContent className="p-0">
          {loading && !cryptos.length && <LoadingSkeleton />}
          {error && <p className="text-destructive text-center">{error}</p>}
          {!loading && !error && visibleCryptos.length === 0 && (
              <p className="text-muted-foreground text-center p-4">No results found.</p>
          )}
          {visibleCryptos.length > 0 && (
            <>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="p-2 w-10 text-center text-xs">#</TableHead>
                          <TableHead className="p-2 text-xs">Coin</TableHead>
                          <TableHead className="p-2 text-right text-xs">Price</TableHead>
                          <TableHead className="p-2 text-right text-xs">{getDynamicHeader()}</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {visibleCryptos.map((crypto, index) => (
                          <CryptoListItem 
                              key={`${crypto.id}-${crypto.symbol}`} 
                              crypto={crypto} 
                              rank={index + 1} 
                              activeSortKey={sortKey}
                              onCoinSelect={onCoinSelect}
                          />
                      ))}
                  </TableBody>
              </Table>
              {visibleCount < sortedCryptos.length && (
                  <Button variant="outline" className="w-full mt-4" onClick={handleShowMore}>
                      Show More
                  </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
