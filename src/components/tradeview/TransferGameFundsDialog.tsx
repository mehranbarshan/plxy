
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SPOT_BALANCE_KEY = 'tradeview_spot_balance';
const FUTURES_BALANCE_KEY = 'tradeview_demo_balance';
const GAME_BALANCE_KEY = 'game_balance';

type AccountType = 'Spot' | 'Futures' | 'Game';

interface TransferGameFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFundsTransferred?: () => void;
}

export default function TransferGameFundsDialog({
  open,
  onOpenChange,
  onFundsTransferred,
}: TransferGameFundsDialogProps) {
  const [fromAccount, setFromAccount] = useState<AccountType>('Futures');
  const [toAccount, setToAccount] = useState<AccountType>('Game');
  const [amount, setAmount] = useState('');
  const [balances, setBalances] = useState<Record<AccountType, number>>({
      Spot: 0,
      Futures: 0,
      Game: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const spot = localStorage.getItem(SPOT_BALANCE_KEY);
      const futures = localStorage.getItem(FUTURES_BALANCE_KEY);
      const game = localStorage.getItem(GAME_BALANCE_KEY);
      setBalances({
          Spot: spot ? parseFloat(spot) : 5000,
          Futures: futures ? parseFloat(futures) : 10000,
          Game: game ? parseFloat(game) : 0,
      });
    }
  }, [open]);

  const availableBalance = balances[fromAccount];
  const accountOptions: AccountType[] = ['Spot', 'Futures', 'Game'];

  const handleSwap = () => {
    const currentFrom = fromAccount;
    const currentTo = toAccount;

    // A simple swap might lead to an invalid state where "To" and "From" are the same
    // if only one of them is changed.
    // Instead, determine the new state based on current values.
    if (currentFrom === 'Game') {
        setFromAccount(currentTo);
        setToAccount('Game');
    } else {
        setFromAccount('Game');
        setToAccount(currentFrom);
    }
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
    if (fromAccount === toAccount) {
      toast({ variant: 'destructive', title: 'Invalid Transfer', description: 'Cannot transfer funds to the same account.' });
      return;
    }

    const newBalances = { ...balances };
    newBalances[fromAccount] -= transferAmount;
    newBalances[toAccount] += transferAmount;
    
    localStorage.setItem(SPOT_BALANCE_KEY, newBalances['Spot'].toString());
    localStorage.setItem(FUTURES_BALANCE_KEY, newBalances['Futures'].toString());
    localStorage.setItem(GAME_BALANCE_KEY, newBalances['Game'].toString());
    
    window.dispatchEvent(new Event('balanceUpdated'));
    
    toast({ title: 'Transfer Successful', description: `${transferAmount.toFixed(2)} USDT transferred from ${fromAccount} to ${toAccount}.`});
    
    setBalances(newBalances);
    setAmount('');
    onOpenChange(false);
    if(onFundsTransferred) {
        onFundsTransferred();
    }
  };

  const getBalanceKey = (account: AccountType) => {
      if (account === 'Spot') return SPOT_BALANCE_KEY;
      if (account === 'Futures') return FUTURES_BALANCE_KEY;
      return GAME_BALANCE_KEY;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[350px] rounded-2xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Transfer Game Funds</DialogTitle>
        </DialogHeader>
        <div className="px-6 space-y-4">
            <div className="flex items-center justify-between bg-secondary p-3 rounded-xl">
                <Select value={fromAccount} onValueChange={(v) => setFromAccount(v as AccountType)}>
                    <SelectTrigger className="border-none bg-transparent focus:ring-0 w-[120px]">
                        <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                        {accountOptions.map(acc => <SelectItem key={acc} value={acc}>{acc} Wallet</SelectItem>)}
                    </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" onClick={handleSwap}>
                    <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
                
                <Select value={toAccount} onValueChange={(v) => setToAccount(v as AccountType)}>
                    <SelectTrigger className="border-none bg-transparent focus:ring-0 w-[120px] justify-end">
                        <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                        {accountOptions.map(acc => <SelectItem key={acc} value={acc}>{acc} Wallet</SelectItem>)}
                    </SelectContent>
                </Select>
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
