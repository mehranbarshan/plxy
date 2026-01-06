
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Info, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface AdjustLeverageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signal: {
    ticker: string;
    leverage: number;
  } | null;
  onConfirm: (newLeverage: number, applyToAll: boolean) => void;
}

export default function AdjustLeverageDialog({
  open,
  onOpenChange,
  signal,
  onConfirm,
}: AdjustLeverageDialogProps) {
  const [leverage, setLeverage] = useState(75);
  const [applyToAll, setApplyToAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (signal && open) {
      setLeverage(signal.leverage > 100 ? 100 : signal.leverage);
    } else if (open) {
        setLeverage(75);
    }
  }, [signal, open]);
  
  const handleConfirm = () => {
    if (!signal) return;
    onConfirm(leverage, applyToAll);
  };
  
  const handleLeverageChange = (value: number[]) => {
      setLeverage(value[0]);
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber;
    if (!isNaN(value)) {
        setLeverage(Math.max(1, Math.min(100, value)));
    }
  }

  const incrementLeverage = () => {
    setLeverage(prev => Math.min(prev + 1, 100));
  }

  const decrementLeverage = () => {
    setLeverage(prev => Math.max(prev - 1, 1));
  }

  const leverageTicks = [1, 25, 50, 75, 100];


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[300px] rounded-2xl p-0">
         <DialogHeader className="p-6 pb-4">
            <DialogTitle>Leverage</DialogTitle>
             <DialogTitle className="sr-only">Adjust Leverage</DialogTitle>
        </DialogHeader>
        <div className="px-6 space-y-6">
             <div className="flex items-center justify-between bg-secondary rounded-lg p-1">
                <Button variant="ghost" size="icon" onClick={decrementLeverage} className="h-8 w-8">
                    <Minus className="w-4 h-4"/>
                </Button>
                <div className="relative w-20">
                    <Input 
                      type="number" 
                      value={leverage} 
                      onChange={handleInputChange} 
                      className="pr-6 h-8 text-sm text-center font-bold bg-transparent border-none focus-visible:ring-0" 
                      min="1"
                      max="100"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">X</span>
                </div>
                 <Button variant="ghost" size="icon" onClick={incrementLeverage} className="h-8 w-8">
                    <Plus className="w-4 h-4"/>
                </Button>
            </div>
            <div className="relative px-2">
                 <Slider
                    value={[leverage]}
                    onValueChange={handleLeverageChange}
                    max={100}
                    step={1}
                    min={1}
                    className="w-full"
                />
                <div className="flex justify-between w-full mt-2 text-xs text-muted-foreground">
                    {leverageTicks.map((tick) => (
                        <span key={tick}>{tick}x</span>
                    ))}
                </div>
            </div>
            
             <div className="flex items-center space-x-2">
                <Checkbox id="apply-all-futures-dialog" checked={applyToAll} onCheckedChange={(checked) => setApplyToAll(Boolean(checked))} />
                <Label htmlFor="apply-all-futures-dialog" className="text-xs font-normal text-muted-foreground">
                    Applies to all futures
                </Label>
            </div>
            
             <p className="text-center text-xs text-muted-foreground">
                Max. openable position at market price and current leverage: 0 USDT
            </p>
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button type="submit" onClick={handleConfirm} className="w-full h-12 text-base">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
