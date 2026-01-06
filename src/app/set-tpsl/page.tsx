

"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Target, BarChart, TrendingUp, TrendingDown, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CryptoData } from '@/components/tradeview/crypto-combobox';


interface TpslDraftInfo {
    selectedCrypto: CryptoData;
    price: string;
    leverage: number;
    positionType: 'Long' | 'Short';
    sizeInUsdt: string;
}

interface TakeProfitTarget {
    id: number;
    price: string;
    percentage: number; 
}

function SectionCard({ title, icon, children, description }: { title: string; icon: React.ReactNode; children: React.ReactNode; description?: string }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-secondary p-2 rounded-lg">{icon}</div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

const TakeProfitTargetItem = ({ 
  target, 
  index,
  entryPrice,
  positionType,
  positionSize,
  leverage,
  onTargetChange,
  onRemoveTarget,
  isOnlyTarget 
} : {
  target: TakeProfitTarget;
  index: number;
  entryPrice: number;
  positionType: 'Long' | 'Short';
  positionSize: number;
  leverage: number;
  onTargetChange: (id: number, field: keyof Omit<TakeProfitTarget, 'id'>, value: string | number) => void;
  onRemoveTarget: (id: number) => void;
  isOnlyTarget: boolean;
}) => {
  
  const roe = useMemo(() => {
    const price = parseFloat(target.price);
    if (!isNaN(price) && entryPrice > 0) {
      const priceChangePercent = ((price - entryPrice) / entryPrice);
      const directionalPriceChange = positionType === 'Long' ? priceChangePercent : -priceChangePercent;
      return directionalPriceChange * leverage * 100;
    }
    return 0;
  }, [target.price, entryPrice, positionType, leverage]);

  const profitInUSDT = useMemo(() => {
      const price = parseFloat(target.price);
      if (!isNaN(price) && entryPrice > 0 && positionSize > 0) {
          const sizeInAsset = (positionSize * leverage) / entryPrice;
          if(positionType === 'Long') {
              return (price - entryPrice) * sizeInAsset;
          } else {
              return (entryPrice - price) * sizeInAsset;
          }
      }
      return 0;
  }, [target.price, entryPrice, positionSize, positionType, leverage]);

  return (
    <div className="space-y-4 border p-4 rounded-lg relative">
      {!isOnlyTarget && (
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 w-7 h-7" onClick={() => onRemoveTarget(target.id)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      )}
      <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
              <Label htmlFor={`tp-price-${target.id}`}>TP Price {index + 1} (USDT)</Label>
              <Input id={`tp-price-${target.id}`} placeholder="Enter target price" value={target.price} onChange={(e) => onTargetChange(target.id, 'price', e.target.value)} type="number" />
          </div>
           <div className="space-y-2">
              <Label htmlFor={`tp-profit-${target.id}`}>Profit (ROE %)</Label>
              <Input id={`tp-profit-${target.id}`} value={`${profitInUSDT.toFixed(2)} USDT (${roe.toFixed(2)}%)`} readOnly className="bg-secondary border-none" />
          </div>
      </div>
      <div className="space-y-2">
          <div className="flex items-center justify-between">
              <Label htmlFor={`tp-percent-${target.id}`}>Price Change ({target.percentage.toFixed(2)}%)</Label>
              
          </div>
          <Slider 
              id={`tp-percent-${target.id}`} 
              value={[target.percentage]} 
              onValueChange={(vals) => onTargetChange(target.id, 'percentage', vals[0])}
              max={200} 
              step={1} 
          />
      </div>
    </div>
  );
}


export default function SetTpslPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tpslDraft, setTpslDraft] = useState<TpslDraftInfo | null>(null);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfitTargets, setTakeProfitTargets] = useState<TakeProfitTarget[]>([
    { id: Date.now(), price: '', percentage: 10 }
  ]);
  const [lastCorrectedToastTime, setLastCorrectedToastTime] = useState(0);
  const [stopLossPercentage, setStopLossPercentage] = useState(10);

  useEffect(() => {
    const savedFuturesDraft = localStorage.getItem('tradeview_futures_draft');
    if (!savedFuturesDraft) {
        toast({ variant: "destructive", title: "No Draft Found", description: "Please start creating a signal first." });
        router.back();
        return;
    }

    try {
        const draftState: TpslDraftInfo = JSON.parse(savedFuturesDraft);
        setTpslDraft(draftState);

        const savedTpslSettings = localStorage.getItem('tradeview_tpsl_draft_settings');
        if (savedTpslSettings) {
            const parsedTpsl = JSON.parse(savedTpslSettings);
            if (parsedTpsl.takeProfitTargets && parsedTpsl.takeProfitTargets.length > 0) {
                setTakeProfitTargets(parsedTpsl.takeProfitTargets);
            } else if (parsedTpsl.takeProfit) { // Backward compatibility
                setTakeProfitTargets([{ id: Date.now(), price: parsedTpsl.takeProfit, percentage: 0 }]);
            }
            if (parsedTpsl.stopLoss) {
                setStopLoss(parsedTpsl.stopLoss);
            }
        }
    } catch (error) {
        console.error("Failed to parse draft from localStorage", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load trade information." });
        router.back();
    }
  }, [router, toast]);


  const entryPrice = useMemo(() => parseFloat(tpslDraft?.price || '0'), [tpslDraft]);
  const positionType = useMemo(() => tpslDraft?.positionType || 'Long', [tpslDraft]);
  const positionSize = useMemo(() => parseFloat(tpslDraft?.sizeInUsdt || '0'), [tpslDraft]);
  const leverage = useMemo(() => tpslDraft?.leverage || 1, [tpslDraft]);
  const cryptoSymbol = useMemo(() => tpslDraft?.selectedCrypto?.symbol || 'N/A', [tpslDraft]);

  const lossInUSDT = useMemo(() => {
    const slPrice = parseFloat(stopLoss);
    if (!isNaN(slPrice) && entryPrice > 0 && positionSize > 0) {
      const sizeInAsset = (positionSize * leverage) / entryPrice;
      if (positionType === 'Long') {
        return (slPrice - entryPrice) * sizeInAsset; 
      } else {
        return (entryPrice - slPrice) * sizeInAsset; 
      }
    }
    return 0;
  }, [stopLoss, entryPrice, positionSize, positionType, leverage]);
  
  const slRoe = useMemo(() => {
    const slPrice = parseFloat(stopLoss);
    if (!isNaN(slPrice) && entryPrice > 0) {
      const priceChangePercent = ((slPrice - entryPrice) / entryPrice);
      const directionalPriceChange = positionType === 'Long' ? priceChangePercent : -priceChangePercent;
      return directionalPriceChange * leverage * 100;
    }
    return 0;
  },[stopLoss, entryPrice, positionType, leverage])

  
  const handleStopLossPercentageChange = (value: number[]) => {
      const newPercentage = value[0];
      setStopLossPercentage(newPercentage);
      if (entryPrice > 0) {
          const percentValue = newPercentage / 100;
          let calculatedPrice;
          if (positionType === 'Long') {
              calculatedPrice = entryPrice * (1 - percentValue);
          } else {
              calculatedPrice = entryPrice * (1 + percentValue);
          }
          setStopLoss(calculatedPrice > 0 ? calculatedPrice.toFixed(4) : '0.00');
      }
  };
  
  const handleStopLossChange = (value: string) => {
    setStopLoss(value);
    if(entryPrice > 0) {
        const slPrice = parseFloat(value);
        if (!isNaN(slPrice) && slPrice > 0) {
            let percent;
            if (positionType === 'Long') {
                percent = ((entryPrice - slPrice) / entryPrice) * 100;
            } else {
                percent = ((slPrice - entryPrice) / entryPrice) * 100;
            }
            if (percent >= 0 && percent <= 100) {
                setStopLossPercentage(parseFloat(percent.toFixed(2)));
            }
        }
    }
  };


  // This effect recalculates all target prices and SL price whenever the entry price changes.
  useEffect(() => {
    if (entryPrice > 0) {
        // Recalculate TP targets based on their existing percentages
        setTakeProfitTargets(prevTargets =>
            prevTargets.map(target => {
                const percent = target.percentage / 100;
                let calculatedPrice;
                if (positionType === 'Long') {
                    calculatedPrice = entryPrice * (1 + percent);
                } else {
                    calculatedPrice = entryPrice * (1 - percent);
                }
                return { ...target, price: calculatedPrice > 0 ? calculatedPrice.toFixed(4) : '0.00' };
            })
        );

        // Recalculate SL based on its existing percentage
        const slPercentValue = stopLossPercentage / 100;
        let calculatedSlPrice;
        if (positionType === 'Long') {
            calculatedSlPrice = entryPrice * (1 - slPercentValue);
        } else {
            calculatedSlPrice = entryPrice * (1 + slPercentValue);
        }
        setStopLoss(calculatedSlPrice > 0 ? calculatedSlPrice.toFixed(4) : '0.00');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryPrice, positionType]);


  const handleConfirm = () => {
    if (!tpslDraft) return;

    const finalDraft = {
        takeProfitTargets: takeProfitTargets.filter(t => t.price && parseFloat(t.price) > 0),
        stopLoss: stopLoss,
    };
    
    localStorage.setItem('tradeview_tpsl_draft_settings', JSON.stringify(finalDraft));
    
    toast({
      title: "TP/SL Settings Saved",
      description: "Your advanced settings have been saved as a draft.",
    });
    router.back();
  }
  
  const validateAndCorrectTargets = useCallback((newTargets: TakeProfitTarget[]) => {
      let corrected = false;
      const MIN_PERCENT_DIFF = 5;

      const sortedTargets = [...newTargets].sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        if(isNaN(priceA) || isNaN(priceB)) return 0;
        return positionType === 'Long' ? priceA - priceB : priceB - priceA;
      });

      for (let i = 0; i < sortedTargets.length - 1; i++) {
          const currentTarget = sortedTargets[i];
          const nextTarget = sortedTargets[i+1];
          
          const currentPrice = parseFloat(currentTarget.price);
          const nextPrice = parseFloat(nextTarget.price);

          if(isNaN(currentPrice) || isNaN(nextPrice) || currentPrice <= 0) continue;

          const priceDiffPercent = Math.abs(nextPrice - currentPrice) / currentPrice * 100;
          
          let needsCorrection = false;
          if (positionType === 'Long') {
              if (nextPrice < currentPrice || priceDiffPercent < MIN_PERCENT_DIFF) {
                  needsCorrection = true;
                  const correctedPrice = currentPrice * (1 + MIN_PERCENT_DIFF / 100);
                  nextTarget.price = correctedPrice.toFixed(4);
              }
          } else { // Short
              if (nextPrice > currentPrice || priceDiffPercent < MIN_PERCENT_DIFF) {
                  needsCorrection = true;
                  const correctedPrice = currentPrice * (1 - MIN_PERCENT_DIFF / 100);
                  nextTarget.price = correctedPrice > 0 ? correctedPrice.toFixed(4) : '0.00';
              }
          }
          if (needsCorrection) corrected = true;
      }
      
      const updatedAndSorted = sortedTargets.map(target => {
          const price = parseFloat(target.price);
          if (!isNaN(price) && entryPrice > 0) {
             const priceChangePercent = ((price - entryPrice) / entryPrice) * 100;
             target.percentage = positionType === 'Long' ? priceChangePercent : -priceChangePercent;
          }
          return target;
      });

      return { corrected, newTargets: updatedAndSorted };

  }, [positionType, entryPrice]);


  const handleTargetChange = useCallback((id: number, field: keyof Omit<TakeProfitTarget, 'id'>, value: string | number) => {
    let corrected = false;
    const updatedTargets = takeProfitTargets.map(target => {
      if (target.id === id) {
        const newTarget = { ...target, [field]: value };
        
        if (field === 'price' && entryPrice > 0) {
          const newPrice = parseFloat(value as string);
          if (!isNaN(newPrice) && newPrice > 0) {
            let priceChangePercent = ((newPrice - entryPrice) / entryPrice) * 100;
            newTarget.percentage = positionType === 'Long' ? priceChangePercent : -priceChangePercent;
          }
        }
        
        if (field === 'percentage') {
            if (entryPrice > 0) {
            const percent = Number(value) / 100;
            let calculatedPrice;
            if (positionType === 'Long') {
              calculatedPrice = entryPrice * (1 + percent);
            } else {
              calculatedPrice = entryPrice * (1 - percent);
            }
            newTarget.price = calculatedPrice > 0 ? calculatedPrice.toFixed(4) : '0.00';
          }
        }
        return newTarget;
      }
      return target;
    });

    const validationResult = validateAndCorrectTargets(updatedTargets);
    
    if (validationResult.corrected) {
        const now = Date.now();
        if (now - lastCorrectedToastTime > 3000) { // Throttle toast to every 3 seconds
            toast({
                variant: 'default',
                title: "Target Corrected",
                description: `TP targets must be sequential with at least a 5% difference. We've adjusted them for you.`,
            });
            setLastCorrectedToastTime(now);
        }
    }

    setTakeProfitTargets(validationResult.newTargets);

  }, [takeProfitTargets, entryPrice, positionType, validateAndCorrectTargets, toast, lastCorrectedToastTime]);
  
  const handleAddTarget = () => {
    if (takeProfitTargets.length < 3) {
      const newId = Date.now();
      const lastTarget = takeProfitTargets[takeProfitTargets.length -1];
      let lastPercentage = lastTarget?.percentage || 0;
      if (isNaN(lastPercentage)) lastPercentage = 0;

      const newPercentage = lastPercentage + 10;
      
      let newPrice = '';
      if(entryPrice > 0) {
          const percent = newPercentage / 100;
          if (positionType === 'Long') {
            newPrice = (entryPrice * (1 + percent)).toFixed(4);
          } else {
            newPrice = (entryPrice * (1 - percent)).toFixed(4);
          }
      }

      setTakeProfitTargets([...takeProfitTargets, { id: newId, price: newPrice, percentage: newPercentage }]);
    }
  }

  const handleRemoveTarget = (id: number) => {
    if (takeProfitTargets.length > 1) {
        setTakeProfitTargets(takeProfitTargets.filter(target => target.id !== id));
    }
  };

  const riskRewardRatio = useMemo(() => {
    const slPrice = parseFloat(stopLoss);
    if (!takeProfitTargets.length || !slPrice || isNaN(slPrice)) return null;

    const firstTpPrice = parseFloat(takeProfitTargets[0].price);
    if(isNaN(firstTpPrice)) return null;

    const potentialLoss = Math.abs(entryPrice - slPrice);
    const potentialGain = Math.abs(firstTpPrice - entryPrice);

    if (potentialLoss === 0) return null;

    return (potentialGain / potentialLoss).toFixed(2);

  }, [takeProfitTargets, stopLoss, entryPrice]);

  if (!tpslDraft) {
    return (
        <div className="flex flex-col min-h-screen bg-background font-body items-center justify-center">
            <p>Loading trade info...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="p-4 flex items-center gap-4 container mx-auto max-w-2xl">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
           <h1 className="text-lg font-bold">Advanced TP/SL</h1>
           <p className="text-sm text-muted-foreground">{cryptoSymbol.replace('USDT','')} {positionType} Position</p>
        </div>
      </header>

      <main className="flex-grow container mx-auto max-w-2xl px-4 pb-8 space-y-6">
        <SectionCard 
            title="Take Profit" 
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            description="Set up to 3 take profit targets"
        >
            <div className="space-y-4">
              {takeProfitTargets.map((target, index) => (
                 <TakeProfitTargetItem
                    key={target.id}
                    target={target}
                    index={index}
                    entryPrice={entryPrice}
                    positionType={positionType}
                    positionSize={positionSize}
                    leverage={leverage}
                    onTargetChange={handleTargetChange}
                    onRemoveTarget={handleRemoveTarget}
                    isOnlyTarget={takeProfitTargets.length === 1}
                 />
              ))}
            </div>
             <Button variant="outline" className="w-full" onClick={handleAddTarget} disabled={takeProfitTargets.length >= 3}>Add Another TP Target</Button>
        </SectionCard>

        <SectionCard 
            title="Stop Loss" 
            icon={<TrendingDown className="w-5 h-5 text-red-500" />}
            description="Protect your position from large losses"
        >
             <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label htmlFor="sl-price">SL Price (USDT)</Label>
                    <Input id="sl-price" placeholder="Enter stop loss price" value={stopLoss} onChange={(e) => handleStopLossChange(e.target.value)} type="number" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="sl-loss">Loss (ROE %)</Label>
                    <Input id="sl-loss" value={`${lossInUSDT.toFixed(2)} USDT (${slRoe.toFixed(2)}%)`} readOnly className="bg-secondary border-none" />
                </div>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="sl-percent">Loss Percentage ({stopLossPercentage.toFixed(2)}%)</Label>
                </div>
                <Slider 
                    id="sl-percent" 
                    value={[stopLossPercentage]}
                    onValueChange={handleStopLossPercentageChange}
                    max={50} 
                    step={1} 
                />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="trailing-stop" className="font-medium text-sm">Trailing Stop</Label>
                <Button variant="secondary" size="sm">Enable</Button>
            </div>
        </SectionCard>

        {riskRewardRatio && (
            <Card className="rounded-2xl p-4">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <BarChart className="w-4 h-4"/>
                        <span>Risk/Reward Ratio</span>
                    </div>
                    <span className={cn("font-bold text-lg", parseFloat(riskRewardRatio) >= 1.5 ? "text-green-500" : "text-yellow-500")}>
                        {riskRewardRatio} : 1
                    </span>
                </div>
                <Separator className="my-4"/>
                <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300">Strategy Tip</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs">
                        Aim for a risk/reward ratio of at least 1.5:1 to maintain long-term profitability.
                    </AlertDescription>
                </Alert>
            </Card>
        )}

        <Button size="lg" className="w-full h-12 font-semibold" onClick={handleConfirm}>
            Confirm Settings
        </Button>
      </main>
    </div>
  );
}
