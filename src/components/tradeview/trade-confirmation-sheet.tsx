
"use client"

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, Info, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { CryptoData } from './crypto-combobox';

interface TradeConfirmationSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    tradeAction: 'Buy' | 'Sell';
    selectedCrypto: CryptoData | null;
    futuresPrice: string;
}

const FUTURES_BALANCE_KEY = 'tradeview_demo_balance';
const SIGNALS_KEY = 'tradeview_my_signals';

export default function TradeConfirmationSheet({ 
    isOpen, 
    onOpenChange, 
    tradeAction, 
    selectedCrypto,
    futuresPrice
}: TradeConfirmationSheetProps) {
  const [action, setAction] = useState(tradeAction);
  const [amount, setAmount] = useState('0');
  const [leverage, setLeverage] = useState(5);
  const [amountPercentage, setAmountPercentage] = useState(0);
  const [futuresBalance, setFuturesBalance] = useState(10000);
  const { toast } = useToast();

  useEffect(() => {
    setAction(tradeAction);
  }, [tradeAction]);

  useEffect(() => {
    if (isOpen) {
        const balance = localStorage.getItem(FUTURES_BALANCE_KEY);
        setFuturesBalance(balance ? parseFloat(balance) : 10000);
    }
  }, [isOpen]);

  const handleAmountSliderChange = (value: number[]) => {
    setAmountPercentage(value[0]);
    const calculatedAmount = (futuresBalance * value[0]) / 100;
    setAmount(calculatedAmount.toFixed(2));
  }

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) value = 0;
    if (value > futuresBalance) value = futuresBalance;
    setAmount(value.toString());
    setAmountPercentage((value / futuresBalance) * 100);
  }

  const volume = parseFloat(amount) * leverage;

  const handleConfirmTrade = () => {
    if (!selectedCrypto || !amount || parseFloat(amount) <= 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid Trade',
            description: 'Please select a crypto and enter a valid amount.',
        });
        return;
    }
    
    // Deduct margin from balance
    const newBalance = futuresBalance - parseFloat(amount);
    localStorage.setItem(FUTURES_BALANCE_KEY, newBalance.toString());
    window.dispatchEvent(new Event('balanceUpdated'));
    
    const newSignal = {
        id: `${'\'\'\''}${selectedCrypto.symbol}-${Date.now()}`,
        tradeType: action,
        ticker: selectedCrypto.binanceSymbol,
        leverage: leverage,
        risk: 'N/A', // Risk calculation would be more complex
        margin: parseFloat(amount),
        entryPrice: parseFloat(futuresPrice),
        markPrice: parseFloat(futuresPrice),
        openTimestamp: new Date().toISOString(),
        positionMode: 'futures',
        status: 'active',
        orderType: 'market',
    };
    
    const existingSignals = JSON.parse(localStorage.getItem(SIGNALS_KEY) || '[]');
    localStorage.setItem(SIGNALS_KEY, JSON.stringify([...existingSignals, newSignal]));

    toast({
        title: `${'\'\'\''}${action} Order Placed`,
        description: `${'\'\'\''}${action}ing ${selectedCrypto.symbol.replace('USDT','')} with ${leverage}x leverage.`
    });
    
    onOpenChange(false);
  }


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom"
        className="max-w-2xl w-full mx-auto p-4 rounded-t-2xl border-t bg-background h-auto"
        >
        <SheetHeader className="text-center pb-2">
          <SheetTitle>Confirm Trade</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 px-2 pb-2">
            <div className="flex items-center justify-center gap-4">
                <span className={cn("font-semibold", action === 'Sell' ? 'text-foreground' : 'text-muted-foreground')}>Sell</span>
                <Switch
                    checked={action === 'Buy'}
                    onCheckedChange={(checked) => setAction(checked ? 'Buy' : 'Sell')}
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                />
                <span className={cn("font-semibold", action === 'Buy' ? 'text-foreground' : 'text-muted-foreground')}>Buy</span>
            </div>

            <div>
                <Label htmlFor="amount" className="text-xs text-muted-foreground">Amount</Label>
                <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">$</span>
                    <Input id="amount" type="number" value={amount} onChange={handleAmountInputChange} className="pl-6 h-10 text-base" />
                </div>
            </div>

            <div>
                 <Slider
                    value={[amountPercentage]}
                    onValueChange={handleAmountSliderChange}
                    max={100}
                    step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                    <span>5%</span>
                    <span>10%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>90%</span>
                </div>
            </div>
            
            <div className="flex items-end gap-2">
                 <div className="flex-grow">
                    <Label htmlFor="multiplier" className="text-xs text-muted-foreground flex items-center gap-1">Multiplier <Info className="w-3 h-3" /></Label>
                    <Select value={leverage.toString()} onValueChange={(val) => setLeverage(parseInt(val, 10))}>
                        <SelectTrigger id="multiplier" className="h-10 text-base mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 5, 10, 20, 50, 75, 100].map(val => (
                                <SelectItem key={val} value={val.toString()}>X{val}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-10 text-sm relative shrink-0">
                    Video bonus
                     <span className="absolute -top-1 -right-1 text-[8px] bg-red-500 text-white px-1 py-0.5 rounded-sm">AD</span>
                 </Button>
            </div>
            
             <div className="relative border rounded-lg p-2 text-center">
                 <p className="text-xs text-muted-foreground">Stop Loss / Take Profit</p>
                 <p className="font-semibold text-sm flex items-center justify-center gap-2 mt-1"><Lock className="w-3.5 h-3.5"/> Unlock</p>
                 <span className="absolute -top-1 -right-1 text-[8px] bg-red-500 text-white px-1 py-0.5 rounded-sm">AD</span>
            </div>

             <div className="text-sm">
                <p>Volume: <span className="font-semibold">${volume.toLocaleString()}</span></p>
                <p className="text-xs text-muted-foreground">Commission: $0 <Info className="inline w-3 h-3"/></p>
             </div>
             
             <Button 
                className={cn(
                    "w-full h-11 text-base font-bold",
                    action === 'Buy' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                )}
                onClick={handleConfirmTrade}
            >
                <ArrowUp className="w-5 h-5 mr-2"/>
                {action}
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
