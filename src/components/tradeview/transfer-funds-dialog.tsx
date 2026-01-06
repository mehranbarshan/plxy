

"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRightLeft, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const SPOT_BALANCE_KEY = 'tradeview_spot_balance';
const FUTURES_BALANCE_KEY = 'tradeview_demo_balance'; // Using demo balance as futures balance

interface TransferFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFundsTransferred?: () => void;
}

export default function TransferFundsDialog({
  open,
  onOpenChange,
  onFundsTransferred,
}: TransferFundsDialogProps) {
  const [fromAccount, setFromAccount] = useState<'Spot' | 'Futures'>('Spot');
  const [toAccount, setToAccount] = useState<'Spot' | 'Futures'>('Futures');
  const [amount, setAmount] = useState('');
  const [spotBalance, setSpotBalance] = useState(0);
  const [futuresBalance, setFuturesBalance] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const storedSpot = localStorage.getItem(SPOT_BALANCE_KEY);
      const storedFutures = localStorage.getItem(FUTURES_BALANCE_KEY);
      setSpotBalance(storedSpot ? parseFloat(storedSpot) : 5000);
      setFuturesBalance(storedFutures ? parseFloat(storedFutures) : 10000);
    }
  }, [open]);

  const availableBalance = fromAccount === 'Spot' ? spotBalance : futuresBalance;

  const handleSwap = () => {
    setFromAccount(toAccount);
    setToAccount(fromAccount);
  };

  const handleAmountSelect = (percentage: number) => {
    setAmount(((availableBalance * percentage) / 100).toFixed(2));
  }

  const handleConfirm = () => {
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to transfer.' });
      return;
    }
    if (transferAmount > availableBalance) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: `You do not have enough funds in your ${fromAccount} wallet.` });
      return;
    }

    let newSpotBalance = spotBalance;
    let newFuturesBalance = futuresBalance;

    if (fromAccount === 'Spot') {
        newSpotBalance -= transferAmount;
        newFuturesBalance += transferAmount;
    } else {
        newFuturesBalance -= transferAmount;
        newSpotBalance += transferAmount;
    }
    
    localStorage.setItem(SPOT_BALANCE_KEY, newSpotBalance.toString());
    localStorage.setItem(FUTURES_BALANCE_KEY, newFuturesBalance.toString());
    
    // Dispatch a custom event to notify other components in the same tab
    window.dispatchEvent(new Event('balanceUpdated'));
    
    toast({ title: 'Transfer Successful', description: `${transferAmount.toFixed(2)} USDT transferred from ${fromAccount} to ${toAccount}.`});
    
    setSpotBalance(newSpotBalance);
    setFuturesBalance(newFuturesBalance);
    setAmount('');
    onOpenChange(false);
    if(onFundsTransferred) {
        onFundsTransferred();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[350px] rounded-2xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Transfer Funds</DialogTitle>
        </DialogHeader>
        <div className="px-6 space-y-4">
            <div className="flex items-center justify-between bg-secondary p-3 rounded-xl">
                <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="font-semibold">{fromAccount} Wallet</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSwap}>
                    <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">To</p>
                    <p className="font-semibold">{toAccount} Wallet</p>
                </div>
            </div>

            <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    Available Balance: {availableBalance.toFixed(2)} USDT
                </p>
            </div>

            <div>
                <Input 
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 text-lg text-center"
                />
            </div>
            
            <div className="flex justify-around">
                <Button variant="link" size="sm" onClick={() => handleAmountSelect(25)}>25%</Button>
                <Button variant="link" size="sm" onClick={() => handleAmountSelect(50)}>50%</Button>
                <Button variant="link" size="sm" onClick={() => handleAmountSelect(75)}>75%</Button>
                <Button variant="link" size="sm" onClick={() => handleAmountSelect(100)}>Max</Button>
            </div>

        </div>
        <DialogFooter className="p-6 pt-4">
          <Button type="submit" onClick={handleConfirm} className="w-full h-12 text-base">Confirm Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
