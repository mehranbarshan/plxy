
"use client";

import { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CandlestickChart,
  ChevronDown,
  Coins,
  DollarSign,
  Zap,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import TradingViewWidget from '@/components/tradeview/tradingview-widget';
import BottomNav from '@/components/tradeview/bottom-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CryptoCombobox from '@/components/tradeview/crypto-combobox';
import { useLocalStorageCrypto } from '@/hooks/useLocalStorageCrypto';
import Image from 'next/image';
import Link from 'next/link';
import FuturesHeader from '@/components/tradeview/futures-header';
import TradeConfirmationSheet from '@/components/tradeview/trade-confirmation-sheet';

const formatPrice = (price: number | string | undefined | null) => {
    if (price === undefined || price === null) return 'N/A';
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(priceNum)) return 'N/A';
    return `$${priceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
}

function FuturesPageContent() {
    const searchParams = useSearchParams();
    const [timeframe, setTimeframe] = useState('1m');
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D'];
    const {
        selectedCrypto,
        updateSelectedCrypto,
        price: futuresPrice,
        setPrice: setFuturesPrice,
        orderType,
        setOrderType,
        high24h,
        low24h
      } = useLocalStorageCrypto("tradeview_futures_crypto", searchParams);

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [tradeAction, setTradeAction] = useState<'Buy' | 'Sell'>('Buy');

    const handleTradeButtonClick = (action: 'Buy' | 'Sell') => {
        setTradeAction(action);
        setIsSheetOpen(true);
    }
  
  
    const getIntervalForTradingView = (tf: string) => {
      if (tf.endsWith('m')) return tf.replace('m', '');
      if (tf.endsWith('h')) return (parseInt(tf.replace('h', '')) * 60).toString();
      if (tf.endsWith('D')) return 'D';
      return '1';
    }
  
    return (
      <div className="flex flex-col h-screen bg-background font-body text-foreground">
        
        <header className="bg-secondary container mx-auto max-w-3xl px-4 pt-4">
            <FuturesHeader />
        </header>

        <main className="flex-grow flex flex-col p-4 space-y-4 pb-20 min-h-0">
  
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-auto">
                <CryptoCombobox
                  selectedCrypto={selectedCrypto}
                  onSelect={updateSelectedCrypto}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-secondary border-none h-9 text-sm w-20"
                  >
                    {timeframe} <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {timeframes.map(tf => (
                    <DropdownMenuItem key={tf} onSelect={() => setTimeframe(tf)}>
                      {tf}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
  
              <Button variant="outline" size="icon" className="bg-secondary border-none h-9 w-9">
                <CandlestickChart className="w-5 h-5" />
              </Button>
            </div>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-9 text-sm relative">
              Pro Mode
              <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1 rounded-sm text-[8px]">
                AD
              </span>
            </Button>
          </div>
  
          {/* Chart Placeholder */}
          <div className="flex-grow rounded-2xl overflow-hidden">
            <TradingViewWidget 
              symbol={selectedCrypto ? `BINANCE:${selectedCrypto.binanceSymbol}` : "BINANCE:BTCUSDT"} 
              interval={getIntervalForTradingView(timeframe)} 
            />
          </div>
  
          <div>
              <div className="bg-secondary rounded-2xl p-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                  {selectedCrypto ? (
                      <Image src={selectedCrypto.image} alt={selectedCrypto.symbol} width={40} height={40} className="rounded-full" />
                  ) : (
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      B
                      </div>
                  )}
                  <div>
                      <p className="font-bold">{selectedCrypto ? selectedCrypto.symbol.replace('USDT', '') : 'Bitcoin'}</p>
                      <p className="text-xs text-muted-foreground">{selectedCrypto ? selectedCrypto.binanceSymbol : 'BTC'}/USD</p>
                  </div>
                  </div>
                  <Button
                  variant="outline"
                  className="bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-300 h-9 text-sm"
                  >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Video bonus ▸
                  </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                  <p className="text-xs text-muted-foreground">24h low:</p>
                  <p className="font-semibold">{formatPrice(low24h)}</p>
                  </div>
                  <div className="text-right">
                  <p className="text-xs text-muted-foreground">24h high:</p>
                  <p className="font-semibold">{formatPrice(high24h)}</p>
                  </div>
              </div>
              </div>
          </div>
        </main>
  
        <footer className="sticky bottom-[66px] bg-background p-4 grid grid-cols-2 gap-4 border-t">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white h-14 rounded-2xl text-lg font-bold"
            onClick={() => handleTradeButtonClick('Sell')}
          >
            <ArrowDown className="w-5 h-5 mr-2" />
            Sell
          </Button>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white h-14 rounded-2xl text-lg font-bold"
            onClick={() => handleTradeButtonClick('Buy')}
          >
            <ArrowUp className="w-5 h-5 mr-2" />
            Buy
          </Button>
        </footer>
        <div className="sticky bottom-0">
          <BottomNav />
        </div>

        <TradeConfirmationSheet 
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            tradeAction={tradeAction}
            selectedCrypto={selectedCrypto}
            futuresPrice={futuresPrice}
        />
      </div>
    );
}


export default function FuturesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FuturesPageContent />
    </Suspense>
  )
}
