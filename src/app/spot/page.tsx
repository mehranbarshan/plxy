
"use client";

import { Suspense, useEffect, useRef, useState } from 'react';
import BottomNav from '@/components/tradeview/bottom-nav';
import CryptoCombobox from '@/components/tradeview/crypto-combobox';
import type { Signal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Minus,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocalStorageCrypto } from '@/hooks/useLocalStorageCrypto';


function NumberInputWithControls({
  placeholder,
  unit,
  value,
  onChange,
  onDecrement,
  onIncrement,
  disabled,
}: {
  placeholder: string;
  unit: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDecrement?: () => void;
  onIncrement?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={onDecrement}
        disabled={disabled}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <div className="relative flex-grow">
        <Input
          type="number"
          placeholder={placeholder}
          className="bg-secondary border-none pr-12 text-center"
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {unit}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={onIncrement}
        disabled={disabled}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}

const SPOT_BALANCE_KEY = 'tradeview_spot_balance';
const SIGNALS_KEY = 'tradeview_my_signals';


function SpotTradingForm() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const {
      selectedCrypto,
      updateSelectedCrypto,
      price: spotPrice,
      setPrice: setSpotPrice,
      orderType,
      setOrderType,
    } = useLocalStorageCrypto("tradeview_spot_crypto", searchParams);

  const [tradeType, setTradeType] = useState('buy');
  const [amountPercentage, setAmountPercentage] = useState([50]);
  const [spotBalance, setSpotBalance] = useState(5000);
  const [totalUsdt, setTotalUsdt] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isTradeAmountValid, setIsTradeAmountValid] = useState(true);
  const [sellHalfOnDoubling, setSellHalfOnDoubling] = useState(false);

  useEffect(() => {
    const balance = localStorage.getItem(SPOT_BALANCE_KEY);
    setSpotBalance(balance ? parseFloat(balance) : 5000);

    const handleStorageChange = () => {
        const updatedBalance = localStorage.getItem(SPOT_BALANCE_KEY);
        setSpotBalance(updatedBalance ? parseFloat(updatedBalance) : 5000);
    }
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('balanceUpdated', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('balanceUpdated', handleStorageChange);
    }
  }, []);

  const handleSliderChange = (value: number[]) => {
    setAmountPercentage(value);
    const percentage = value[0] / 100;
    const usdtValue = spotBalance * percentage;
    setTotalUsdt(usdtValue.toFixed(2));
    
    const price = parseFloat(spotPrice);
    if(price > 0) {
        setQuantity((usdtValue / price).toFixed(4));
    }
    setIsTradeAmountValid(usdtValue >= 5);
  };

  const handleUsdtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let usdtValue = e.target.value;
    const numericUsdtValue = parseFloat(usdtValue);

    if (numericUsdtValue > spotBalance) {
      usdtValue = spotBalance.toString();
    }
    setTotalUsdt(usdtValue);
    setIsTradeAmountValid(parseFloat(usdtValue) >= 5);

    if (spotBalance > 0) {
        const newPercentage = (parseFloat(usdtValue) / spotBalance) * 100;
        setAmountPercentage([Math.min(100, Math.max(0, newPercentage))]);
    }
    
    const price = parseFloat(spotPrice);
    if(price > 0 && usdtValue) {
        setQuantity((parseFloat(usdtValue) / price).toFixed(4));
    } else {
        setQuantity('');
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const quantityValue = e.target.value;
      setQuantity(quantityValue);

      const price = parseFloat(spotPrice);
      if (price > 0 && quantityValue) {
          const usdtValue = parseFloat(quantityValue) * price;
          setTotalUsdt(usdtValue.toFixed(2));
          setIsTradeAmountValid(usdtValue >= 5);

          if (spotBalance > 0) {
              const percentage = (usdtValue / spotBalance) * 100;
              setAmountPercentage([Math.min(100, Math.max(0, percentage))]);
          }
      } else {
          setTotalUsdt('');
          setIsTradeAmountValid(false);
      }
  }
  
    const handleExecuteTrade = () => {
        if (!selectedCrypto || !isTradeAmountValid) return;
        
        const amount = parseFloat(totalUsdt);
        const price = parseFloat(spotPrice);
        
        if (tradeType === 'buy') {
            const newSpotBalance = spotBalance - amount;
            localStorage.setItem(SPOT_BALANCE_KEY, newSpotBalance.toString());

            const newSignal: Signal = {
                id: `${selectedCrypto.symbol}-${Date.now()}`,
                tradeType: 'Long', // Spot buy is like a Long position
                ticker: selectedCrypto.binanceSymbol,
                leverage: 1,
                risk: 'N/A',
                margin: amount, // For spot, margin is the total amount
                entryPrice: price,
                markPrice: price,
                positionMode: 'spot',
                status: 'active',
                orderType: orderType,
                openTimestamp: new Date().toISOString(),
                sellHalfOnDoubling: sellHalfOnDoubling,
            };

            const existingSignals: Signal[] = JSON.parse(localStorage.getItem(SIGNALS_KEY) || '[]');
            localStorage.setItem(SIGNALS_KEY, JSON.stringify([...existingSignals, newSignal]));

            toast({
                title: "Buy Order Successful",
                description: `Bought ${quantity} ${selectedCrypto.symbol.replace('USDT', '')} for $${totalUsdt}.`
            });

        } else { // sell
            // This part needs logic for which existing position to sell from.
            // For now, we just simulate a generic sell.
             toast({
                title: "Sell Order Simulated",
                description: `Sold ${quantity} ${selectedCrypto.symbol.replace('USDT', '')}.`
            });
        }
        
        router.push('/trade?tab=my-signals');
    }


  useEffect(() => {
    // Set initial values on mount or when balance changes
    handleSliderChange(amountPercentage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotBalance]);

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 0) newQuantity = 0;
    setQuantity(newQuantity.toFixed(4));
    const price = parseFloat(spotPrice);
    if (price > 0) {
      const usdtValue = newQuantity * price;
      setTotalUsdt(usdtValue.toFixed(2));
      setIsTradeAmountValid(usdtValue >= 5);
      if (spotBalance > 0) {
        const percentage = (usdtValue / spotBalance) * 100;
        setAmountPercentage([Math.min(100, Math.max(0, percentage))]);
      }
    }
  };

  const incrementQuantity = () => {
    const currentQuantity = parseFloat(quantity);
    if (!isNaN(currentQuantity)) {
      updateQuantity(currentQuantity * 1.01);
    }
  };

  const decrementQuantity = () => {
    const currentQuantity = parseFloat(quantity);
    if (!isNaN(currentQuantity)) {
      updateQuantity(currentQuantity * 0.99);
    }
  };

  const incrementPrice = () => {
    const currentPrice = parseFloat(spotPrice);
    if (!isNaN(currentPrice)) {
      setSpotPrice((currentPrice * 1.001).toFixed(4));
    }
  };

  const decrementPrice = () => {
    const currentPrice = parseFloat(spotPrice);
    if (!isNaN(currentPrice) && currentPrice > 0) {
      setSpotPrice((currentPrice * 0.999).toFixed(4));
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl p-4 shadow-sm">
        <Tabs
          value={tradeType}
          onValueChange={setTradeType}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-secondary p-1 h-auto rounded-xl">
            <TabsTrigger
              value="buy"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg"
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-lg"
            >
              Sell
            </TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="mt-4">
            <div className="space-y-4">
              <Select value={orderType} onValueChange={(val) => setOrderType(val as 'limit' | 'market' | 'stop-limit')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="stop-limit">Stop Limit</SelectItem>
                </SelectContent>
              </Select>

              <CryptoCombobox
                selectedCrypto={selectedCrypto}
                onSelect={updateSelectedCrypto}
              />

              <NumberInputWithControls
                placeholder="Price"
                unit="USDT"
                value={spotPrice}
                onChange={(e) => setSpotPrice(e.target.value)}
                onIncrement={incrementPrice}
                onDecrement={decrementPrice}
                disabled={orderType === 'market'}
              />
              <NumberInputWithControls
                placeholder="Quantity"
                unit={selectedCrypto?.symbol.replace(/USDT$/, '') || 'Crypto'}
                value={quantity}
                onChange={handleQuantityChange}
                onIncrement={incrementQuantity}
                onDecrement={decrementQuantity}
              />

              <Slider
                value={amountPercentage}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
                className={cn(
                  tradeType === 'buy'
                    ? '[&>span>span]:bg-green-500'
                    : '[&>span>span]:bg-red-500'
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>

              <Input
                placeholder="Total (USDT)"
                className="bg-secondary border-none text-center"
                value={totalUsdt}
                onChange={handleUsdtChange}
              />

              <div className="flex items-center space-x-2">
                <Checkbox id="sell-half" checked={sellHalfOnDoubling} onCheckedChange={(checked) => setSellHalfOnDoubling(Boolean(checked))} />
                <label
                  htmlFor="sell-half"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sell Half on Doubling
                </label>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avbl</span>
                <span className="font-semibold">{spotBalance.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})} USDT</span>
              </div>

              <Button
                disabled={!isTradeAmountValid}
                className={cn(
                  'w-full h-12 text-base',
                  tradeType === 'buy'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
                onClick={handleExecuteTrade}
              >
                Buy {selectedCrypto?.symbol.replace(/USDT$/, '') || 'Crypto'}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="sell" className="mt-4">
            <div className="space-y-4">
              <Select value={orderType} onValueChange={(val) => setOrderType(val as 'limit' | 'market' | 'stop-limit')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="stop-limit">Stop Limit</SelectItem>
                </SelectContent>
              </Select>

              <CryptoCombobox
                selectedCrypto={selectedCrypto}
                onSelect={updateSelectedCrypto}
              />

              <NumberInputWithControls
                placeholder="Price"
                unit="USDT"
                value={spotPrice}
                onChange={(e) => setSpotPrice(e.target.value)}
                onIncrement={incrementPrice}
                onDecrement={decrementPrice}
                disabled={orderType === 'market'}
              />
              <NumberInputWithControls
                placeholder="Quantity"
                unit={selectedCrypto?.symbol.replace(/USDT$/, '') || 'Crypto'}
                value={quantity}
                onChange={handleQuantityChange}
                onIncrement={incrementQuantity}
                onDecrement={decrementQuantity}
              />

              <Slider
                value={amountPercentage}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
                className={cn(
                  tradeType === 'buy'
                    ? '[&>span>span]:bg-green-500'
                    : '[&>span>span]:bg-red-500'
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>

              <Input
                placeholder="Total (USDT)"
                className="bg-secondary border-none text-center"
                value={totalUsdt}
                onChange={handleUsdtChange}
              />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avbl</span>
                <span className="font-semibold">1,204.55 TRX</span>
              </div>

              <Button
                disabled={!isTradeAmountValid}
                className={cn(
                  'w-full h-12 text-base',
                  tradeType === 'buy'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
                 onClick={handleExecuteTrade}
              >
                Sell {selectedCrypto?.symbol.replace(/USDT$/, '') || 'Crypto'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}


function SpotPageContent() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="p-4 flex items-center gap-4 container mx-auto max-w-2xl sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Spot Trading</h1>
      </header>
      <main className="flex-grow container mx-auto max-w-2xl px-4 py-8 pb-24">
        <SpotTradingForm />
      </main>

      <div className="sticky bottom-0">
        <BottomNav />
      </div>
    </div>
  );
}

export default function SpotPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SpotPageContent />
        </Suspense>
    )
}
