

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, BarChartHorizontal, ExternalLink, Pencil, BarChart, Share2, PlusCircle, Signal as SignalIcon, Check, Percent, Plus, History, TrendingDown, Trash2, Clock } from 'lucide-react';
import ProfileStatCard from '@/components/tradeview/profile-stat-card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import AdjustLeverageDialog from './adjust-leverage-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { formatDistanceToNow, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Separator } from '../ui/separator';
import type { CommunitySignal } from './community-signals-tab';
import { type Member, members as initialMembers } from '@/lib/member-data';
import type { Signal, ClosedSignal } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


function SignalDetail({ label, value, valueClassName }: { label: React.ReactNode; value: string; valueClassName?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-sm font-semibold', valueClassName)}>{value}</p>
    </div>
  );
}

const LOCAL_STORAGE_KEY = 'tradeview_my_signals';
const HISTORY_STORAGE_KEY = 'tradeview_signal_history';
const DEMO_BALANCE_KEY = 'tradeview_demo_balance';
const SPOT_BALANCE_KEY = 'tradeview_spot_balance';
const COMMUNITY_SIGNALS_KEY = 'tradeview_community_signals';
const USERNAME_KEY = 'tradeview_username';
const MEMBERS_KEY = 'tradeview_members';
const MAX_POSITIONS = 20;

const STATS_TOTAL_TRADES_KEY = 'tradeview_total_trades';
const STATS_TOTAL_WINS_KEY = 'tradeview_total_wins';


const exampleSignal: Signal = {
  id: 'btc-example',
  tradeType: 'Long',
  ticker: 'BTCUSDT',
  leverage: 50,
  risk: '1.2%',
  margin: 135.50,
  entryPrice: 67500.00,
  markPrice: 68250.75,
  openTimestamp: new Date().toISOString(),
  positionMode: 'futures',
  takeProfit: '70000',
  stopLoss: '65000',
  status: 'active',
  orderType: 'market',
};

function SignalCard({ signal, onAdjustLeverage, onClosePosition, onSetTpsl }: { signal: Signal; onAdjustLeverage: () => void; onClosePosition: () => void; onSetTpsl: () => void; }) {
  const { toast } = useToast();
  const router = useRouter();
  const { tradeType, ticker, leverage, risk, margin, entryPrice, markPrice, takeProfit, stopLoss } = signal;
  
  const positionSize = margin * leverage;
  const sizeInAsset = entryPrice > 0 ? positionSize / entryPrice : 0;
  
  let pnl = 0;
  if (tradeType === 'Long') {
    pnl = (markPrice - entryPrice) * sizeInAsset;
  } else {
    pnl = (entryPrice - markPrice) * sizeInAsset;
  }

  const roe = margin > 0 ? (pnl / margin) * 100 : 0;
  
  let liqPrice = 0;
  if (entryPrice > 0 && leverage > 0) {
      if (tradeType === 'Long') {
        liqPrice = entryPrice * (1 - (1 / leverage)); 
      } else {
        liqPrice = entryPrice * (1 + (1 / leverage));
      }
  }


  const isWin = pnl >= 0;
  const colorClass = isWin ? 'text-green-500' : 'text-red-500';
  const tradeTypeInitial = tradeType === 'Long' ? 'L' : 'S';
  const tradeTypeBg = tradeType === 'Long' ? 'bg-green-500' : 'bg-red-500';
  const assetName = ticker.replace('USDT', '');
  
  const handleAction = (action: string) => {
    toast({
        title: `Action Simulated`,
        description: `The "${action}" feature is for demonstration purposes.`
    });
  }

  const handleShareWithClub = () => {
    toast({
        title: "Shared with Club",
        description: "Your signal has been shared with your club members.",
    });
  };

  const handleShareWithCommunity = () => {
      toast({
          title: "Shared with Community",
          description: "Your signal is now visible to the entire community.",
      });
  };


  return (
    <Card className="rounded-2xl p-4 shadow-md bg-card">
       <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <div className={cn("flex items-center justify-center w-6 h-6 rounded text-white text-sm font-bold", tradeTypeBg)}>
                    {tradeTypeInitial}
                </div>
                <h3 className="font-bold">{ticker} Perpetual</h3>
                <span className="text-xs text-muted-foreground">Isolated {leverage}x</span>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-5 h-5 text-muted-foreground" onClick={() => handleAction('Signal Info')}>
                    <SignalIcon className="w-5 h-5" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="w-5 h-5 text-muted-foreground">
                            <Share2 className="w-5 h-5" />
                         </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Share Signal</AlertDialogTitle>
                            <AlertDialogDescription>
                                Choose where you want to share this trading signal.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="sm:justify-center flex-col sm:flex-col sm:space-x-0 gap-2">
                             <AlertDialogAction onClick={handleShareWithClub}>Share with Club</AlertDialogAction>
                             <AlertDialogAction onClick={handleShareWithCommunity}>Share with Community</AlertDialogAction>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-left">
                <p className="text-xs text-muted-foreground">Unrealized PNL (USDT)</p>
                <p className={cn("text-xl font-semibold", colorClass)}>{pnl.toFixed(2)}</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-muted-foreground">ROE</p>
                <p className={cn("text-xl font-semibold", colorClass)}>
                    {isWin ? '+' : ''}{roe.toFixed(2)}%
                </p>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
            <SignalDetail label={`Size(${assetName})`} value={sizeInAsset.toFixed(4)} />
            <SignalDetail label="Size(USDT)" value={positionSize.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} />
            <SignalDetail label={<span className="flex items-center gap-1">Margin(USDT) <PlusCircle className="w-3 h-3 text-muted-foreground cursor-pointer" onClick={() => handleAction('Add Margin')}/></span>} value={margin.toFixed(2)} />
            <SignalDetail label="Entry Price" value={entryPrice.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})} />
            <SignalDetail label="Mark Price" value={markPrice.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})} />
            <SignalDetail label="Liq. Price" value={liqPrice > 0 ? liqPrice.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4}) : 'N/A'} />
        </div>

        {(takeProfit || stopLoss) && (
            <>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4">
                    {takeProfit && <SignalDetail label="Take Profit" value={takeProfit} valueClassName="text-green-500" />}
                    {stopLoss && <SignalDetail label="Stop Loss" value={stopLoss} valueClassName="text-red-500" />}
                </div>
            </>
        )}

        <div className="grid grid-cols-3 gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={onAdjustLeverage} className="text-xs h-9">
                Adjust Leverage
            </Button>
            <Button variant="secondary" size="sm" onClick={onSetTpsl} className="text-xs h-9">
                Stop Profit & Loss
            </Button>
            <Button variant="secondary" size="sm" onClick={onClosePosition} className="text-xs h-9">
                Close Position
            </Button>
        </div>
    </Card>
  );
}

function PendingSignalCard({ signal, onCancel }: { signal: Signal; onCancel: () => void; }) {
  const { tradeType, ticker, leverage, entryPrice, margin, orderType, markPrice } = signal;
  const isLong = tradeType === 'Long';
  const tradeTypeInitial = isLong ? 'L' : 'S';
  const tradeTypeBg = isLong ? 'bg-green-500' : 'bg-red-500';
  const assetName = ticker.replace('USDT', '');

  return (
    <Card className="rounded-2xl p-4 bg-secondary/50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg text-white text-base font-bold", tradeTypeBg)}>
            {tradeTypeInitial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold">{assetName}</h3>
              <Badge variant="outline">{orderType}</Badge>
              <Badge variant="outline">{leverage}x</Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Waiting for entry price...
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive">
                <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Pending Signal?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will cancel your {ticker} {tradeType} limit order. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Back</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      Yes, Cancel Signal
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Entry Price</p>
          <p className="font-semibold">${entryPrice.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Current Price</p>
          <p className="font-semibold">${markPrice.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Margin</p>
          <p className="font-semibold">${margin.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Size</p>
          <p className="font-semibold">${(margin * leverage).toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}


function SignalHistory({ history, onClearHistory }: { history: ClosedSignal[], onClearHistory: () => void }) {
    const formatDate = (timestamp?: string) => {
        if (!timestamp) return 'a few moments ago';
        try {
            const date = new Date(timestamp);
             if (isNaN(date.getTime())) {
                return "Invalid date";
             }
            return date.toLocaleString();
        } catch (e) {
            return "Invalid date";
        }
    };

    if (history.length === 0) return null;

    return (
        <Card className="rounded-2xl p-4 mt-6">
            <CardContent className="p-0">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <History className="w-5 h-5 text-muted-foreground" />
                        Signal History
                    </h3>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs">
                                <Trash2 className="w-3 h-3 mr-1" />
                                Clear History
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Clear History?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This will permanently delete all your closed trade records. Your overall win rate stat will not be affected.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onClearHistory} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                    Yes, Clear History
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <div className="space-y-3">
                    {history.map((signal, index) => {
                        const isWin = signal.pnl >= 0;
                        
                        let tradeTypeInitial = 'S';
                        if(signal.positionMode === 'spot') {
                            tradeTypeInitial = signal.tradeType === 'Long' ? 'B' : 'S';
                        } else {
                            tradeTypeInitial = signal.tradeType === 'Long' ? 'L' : 'S';
                        }
                        
                        const tradeTypeBg = signal.tradeType === 'Long' ? 'bg-green-500' : 'bg-red-500';

                        return (
                            <div key={`${signal.id}-${index}`} className="p-2 rounded-lg bg-secondary/50">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold", tradeTypeBg)}>
                                            {tradeTypeInitial}
                                        </div>
                                        <div>
                                            <p className="font-bold">{signal.ticker.replace('USDT', '')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(signal.closeTimestamp)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("font-semibold", isWin ? 'text-green-500' : 'text-red-500')}>
                                            {isWin ? '+' : ''}${signal.pnl.toFixed(2)}
                                        </p>
                                        <p className={cn("text-xs", isWin ? 'text-green-500' : 'text-red-500')}>
                                            {isWin ? '+' : ''}{signal.roe.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-secondary text-xs">
                                     <div>
                                        <p className="text-muted-foreground">Entry</p>
                                        <p className="font-semibold">{signal.entryPrice.toLocaleString()}</p>
                                     </div>
                                      <div className="text-right">
                                        <p className="text-muted-foreground">Exit</p>
                                        <p className="font-semibold">{signal.closePrice.toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Margin</p>
                                        <p className="font-semibold">${signal.margin.toFixed(2)}</p>
                                     </div>
                                     {signal.positionMode === 'futures' &&
                                        <div className="text-right">
                                            <p className="text-muted-foreground">Leverage</p>
                                            <p className="font-semibold">{signal.leverage}x</p>
                                        </div>
                                     }
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default function MySignalsTab() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isAdjustLeverageOpen, setIsAdjustLeverageOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [signalHistory, setSignalHistory] = useState<ClosedSignal[]>([]);
  const autoClosedSignalsRef = useRef<Set<string>>(new Set());
  const router = useRouter();
  const [isCloseAllDialogOpen, setIsCloseAllDialogOpen] = useState(false);
  const [winRate, setWinRate] = useState("N/A");
  const sellHalfTriggeredRef = useRef<Set<string>>(new Set());


  const updateWinRate = () => {
    const totalTrades = parseInt(localStorage.getItem(STATS_TOTAL_TRADES_KEY) || '0', 10);
    const totalWins = parseInt(localStorage.getItem(STATS_TOTAL_WINS_KEY) || '0', 10);
    
    if (totalTrades > 0) {
      const rate = (totalWins / totalTrades) * 100;
      setWinRate(`${rate.toFixed(1)}%`);
    } else {
      setWinRate("N/A");
    }
  };

  useEffect(() => {
    try {
      const storedSignals = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSignals) {
        const parsedSignals = JSON.parse(storedSignals);
        if (Array.isArray(parsedSignals)) {
          setSignals(parsedSignals);
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([exampleSignal]));
        setSignals([exampleSignal]);
      }
      
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
          setSignalHistory(JSON.parse(storedHistory));
      }

      const storedMembers = localStorage.getItem(MEMBERS_KEY);
        if (!storedMembers) {
            localStorage.setItem(MEMBERS_KEY, JSON.stringify(initialMembers));
      }

    } catch (error) {
      console.error("Failed to parse signals from localStorage", error);
      setSignals([exampleSignal]);
    }
    
    updateWinRate();
  }, []);
  
  const closePosition = (signalToClose: Signal, closePrice: number, reason: 'liquidation' | 'tp' | 'sl' | 'manual' | 'partial') => {
    if (!signals.find(s => s.id === signalToClose.id) && reason !== 'partial') {
        console.warn(`Attempted to close a signal (id: ${signalToClose.id}) that is not in the active signals list. Aborting.`);
        return { closedSignal: null, pnl: 0, newBalance: 0 };
    }

    const { tradeType, margin, entryPrice, leverage, id, positionMode } = signalToClose;
    
    let pnl;
    if (reason === 'liquidation') {
        pnl = -margin;
    } else {
        const sizeInAsset = entryPrice > 0 ? (margin * leverage) / entryPrice : 0;
        pnl = tradeType === 'Long' ? (closePrice - entryPrice) * sizeInAsset : (entryPrice - closePrice) * sizeInAsset;
    }
    
    const isWin = pnl >= 0;

    if (reason !== 'partial') {
        const totalTrades = parseInt(localStorage.getItem(STATS_TOTAL_TRADES_KEY) || '0', 10) + 1;
        const totalWins = parseInt(localStorage.getItem(STATS_TOTAL_WINS_KEY) || '0', 10) + (isWin ? 1 : 0);
        localStorage.setItem(STATS_TOTAL_TRADES_KEY, totalTrades.toString());
        localStorage.setItem(STATS_TOTAL_WINS_KEY, totalWins.toString());
    }
    
    if (positionMode === 'futures' && id !== 'btc-example' && ['tp', 'sl', 'liquidation'].includes(reason)) {
        const balanceKey = DEMO_BALANCE_KEY;
        const currentBalance = parseFloat(localStorage.getItem(balanceKey) || '10000');
        const marginPercentage = (margin / currentBalance) * 100;
        const trophiesToChange = Math.round(marginPercentage);
        
        const membersRaw = localStorage.getItem(MEMBERS_KEY);
        const members: Member[] = membersRaw ? JSON.parse(membersRaw) : initialMembers;
        const username = localStorage.getItem(USERNAME_KEY) || 'John Doe';
        
        const memberIndex = members.findIndex(m => m.name === username);
        if(memberIndex !== -1) {
            const currentTrophies = members[memberIndex].trophies;
            members[memberIndex].trophies = isWin ? currentTrophies + trophiesToChange : Math.max(0, currentTrophies - trophiesToChange);
            localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
        }
    }
    
    const balanceKey = positionMode === 'spot' ? SPOT_BALANCE_KEY : DEMO_BALANCE_KEY;
    const defaultBalance = positionMode === 'spot' ? '5000' : '10000';
    const currentBalance = parseFloat(localStorage.getItem(balanceKey) || defaultBalance);
    
    let newBalance = currentBalance;
    if (positionMode === 'spot') {
        newBalance += margin + pnl;
    } else { // futures
        newBalance += pnl;
    }
    localStorage.setItem(balanceKey, newBalance.toString());
    window.dispatchEvent(new Event('balanceUpdated'));
    
    const closedSignal: ClosedSignal = { 
        ...signalToClose,
        id: `${signalToClose.id}-${Date.now()}-${Math.random()}`,
        closePrice, 
        pnl, 
        roe: margin > 0 ? (pnl / margin) * 100 : 0,
        closeTimestamp: new Date().toISOString(),
    };
      
    if (reason !== 'partial') {
        setSignalHistory(prev => [closedSignal, ...prev]);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([closedSignal, ...signalHistory]));
        
        const updatedSignals = signals.filter(s => s.id !== id);
        setSignals(updatedSignals);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSignals));
        
        const communitySignals: CommunitySignal[] = JSON.parse(localStorage.getItem(COMMUNITY_SIGNALS_KEY) || '[]');
        const updatedCommunitySignals = communitySignals.filter(cs => cs.id !== id);
        localStorage.setItem(COMMUNITY_SIGNALS_KEY, JSON.stringify(updatedCommunitySignals));
    }
    
    return { closedSignal, pnl, newBalance };
};

  const handleAdjustLeverageClick = (signal: Signal) => {
    setSelectedSignal(signal);
    setIsAdjustLeverageOpen(true);
  };

  const handleLeverageChange = (newLeverage: number, applyToAll: boolean) => {
    if (!selectedSignal) return;
    
    if (selectedSignal.id === 'btc-example') {
      toast({ title: "This is an example signal and cannot be modified." });
      return;
    }

    const updatedSignals = signals.map(s => {
      if (applyToAll) {
          return { ...s, leverage: newLeverage };
      }
      return s.id === selectedSignal.id ? { ...s, leverage: newLeverage } : s
    });

    setSignals(updatedSignals);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSignals));


    toast({
      title: 'Leverage Adjusted',
      description: `Leverage for ${applyToAll ? 'all positions' : selectedSignal.ticker} set to ${newLeverage}x.`,
    });
    setIsAdjustLeverageOpen(false);
    setSelectedSignal(null);
  };
  
  const handleClosePositionClick = (signal: Signal) => {
    if (signal.id === 'btc-example') {
      toast({ title: "This is an example signal and cannot be closed." });
      return;
    }
    setSelectedSignal(signal);
    setIsConfirmCloseOpen(true);
  };

  const handleSetTpsl = (signal: Signal) => {
    const { tradeType, ticker, leverage, entryPrice, margin } = signal;
    const tpslInfo = {
        selectedCrypto: {
            symbol: ticker,
            lastPrice: entryPrice.toString(),
            image: 'https://picsum.photos/seed/1/32/32',
            binanceSymbol: ticker,
        },
        price: entryPrice.toString(),
        leverage,
        positionType: tradeType,
        sizeInUsdt: margin.toString(),
    };
    localStorage.setItem('tradeview_futures_draft', JSON.stringify(tpslInfo));
    router.push('/set-tpsl');
  }
  
  const confirmClosePosition = () => {
    if (!selectedSignal) return;
    
    const { pnl, newBalance } = closePosition(selectedSignal, selectedSignal.markPrice, 'manual');

    toast({
        title: "Position Closed",
        description: `Your ${selectedSignal.ticker} position has been closed. P&L: ${pnl.toFixed(2)} USDT. New balance: ${newBalance.toFixed(2)} USDT.`
    });
    setIsConfirmCloseOpen(false);
    setSelectedSignal(null);
    updateWinRate();
  };

  const handleClearHistory = () => {
    const newHistory = signalHistory.filter(signal => signal.positionMode === 'futures');
    setSignalHistory(newHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    toast({
        title: "History Cleared",
        description: `Your Closed trading history has been successfully deleted.`
    });
  }

  const handleCancelPending = (signalId: string) => {
    const signalToCancel = signals.find(s => s.id === signalId);
    if (!signalToCancel) return;

    // Return margin to balance
    const balanceKey = signalToCancel.positionMode === 'spot' ? SPOT_BALANCE_KEY : DEMO_BALANCE_KEY;
    const defaultBalance = signalToCancel.positionMode === 'spot' ? '5000' : '10000';
    const currentBalance = parseFloat(localStorage.getItem(balanceKey) || defaultBalance);
    const newBalance = currentBalance + signalToCancel.margin;
    localStorage.setItem(balanceKey, newBalance.toString());
    window.dispatchEvent(new Event('balanceUpdated'));
    
    // Remove signal from state
    const updatedSignals = signals.filter(s => s.id !== signalId);
    setSignals(updatedSignals);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSignals));
    toast({ title: "Signal Canceled", description: "Your pending signal has been canceled and margin returned." });
  };


  const pnlForDialog = () => {
    if (!selectedSignal) return { pnl: 0, isWin: true };
    const { tradeType, margin, entryPrice, markPrice, leverage } = selectedSignal;
    const positionSize = margin * leverage;
    const sizeInAsset = entryPrice > 0 ? positionSize / entryPrice : 0;
    
    let pnl = 0;
    if (tradeType === 'Long') {
      pnl = (markPrice - entryPrice) * sizeInAsset;
    } else {
      pnl = (entryPrice - markPrice) * sizeInAsset;
    }
    return { pnl, isWin: pnl >= 0 };
  }
  
  const todaysPnl = useMemo(() => {
    const now = new Date();
    const todayInterval = { start: startOfDay(now), end: endOfDay(now) };
  
    const closedTodayPnl = signalHistory
      .filter(trade => {
        try {
          if (!trade.closeTimestamp) return false;
          const closeDate = new Date(trade.closeTimestamp);
          if (isNaN(closeDate.getTime())) return false;
          return isWithinInterval(closeDate, todayInterval);
        } catch(e) {
          return false;
        }
      })
      .reduce((sum, trade) => sum + trade.pnl, 0);
  
    const livePnl = signals
      .filter(s => s.status === 'active')
      .reduce((totalPnl, signal) => {
        const { markPrice, tradeType, margin, entryPrice, leverage } = signal;
        if (!markPrice) return totalPnl;
  
        const sizeInAsset = entryPrice > 0 ? (margin * leverage) / entryPrice : 0;
        
        let pnl = 0;
        if (tradeType === 'Long') {
          pnl = (markPrice - entryPrice) * sizeInAsset;
        } else {
          pnl = (entryPrice - markPrice) * sizeInAsset;
        }
        return totalPnl + pnl;
      }, 0);
      
    return closedTodayPnl + livePnl;
  }, [signals, signalHistory]);
  
  const isTodaysPnlPositive = todaysPnl >= 0;

  const activeSignals = useMemo(() => signals.filter(s => s.status === 'active'), [signals]);
  const pendingSignals = useMemo(() => signals.filter(s => s.status === 'pending'), [signals]);
  

  const totalActivePnl = useMemo(() => {
    return activeSignals.reduce((total, signal) => {
        const { tradeType, margin, entryPrice, markPrice, leverage } = signal;
        const positionSize = margin * leverage;
        const sizeInAsset = entryPrice > 0 ? positionSize / entryPrice : 0;
        let pnl = 0;
        if (tradeType === 'Long') {
            pnl = (markPrice - entryPrice) * sizeInAsset;
        } else {
            pnl = (entryPrice - markPrice) * sizeInAsset;
        }
        return total + pnl;
    }, 0);
  }, [activeSignals]);


  const handleCloseAllPositions = () => {
    if (activeSignals.length === 0) {
        toast({ variant: 'destructive', title: 'No Positions', description: 'There are no open positions to close.' });
        return;
    }

    activeSignals.forEach(signal => {
        closePosition(signal, signal.markPrice, 'manual');
    });

    toast({ title: 'All Positions Closed', description: `All ${activeSignals.length} open positions have been closed.` });
    setIsCloseAllDialogOpen(false);
  };
  
    const confirmAndOpenPosition = (signalToOpen: Signal) => {
    const { margin, positionMode } = signalToOpen;
    const balanceKey = positionMode === 'futures' ? DEMO_BALANCE_KEY : SPOT_BALANCE_KEY;
    const defaultBalance = positionMode === 'futures' ? '10000' : '5000';
    const currentBalance = parseFloat(localStorage.getItem(balanceKey) || defaultBalance);

    if (margin > currentBalance) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: 'You do not have enough funds to open this position.',
      });
      return;
    }

    // Deduct margin from balance
    const newBalance = currentBalance - margin;
    localStorage.setItem(balanceKey, newBalance.toString());
    window.dispatchEvent(new Event('balanceUpdated'));
    
    // ... rest of the logic to add signal to state and localStorage ...
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value as 'active' | 'closed');
    };


  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <ProfileStatCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Today's P&L"
                value={`${isTodaysPnlPositive ? '+' : ''}$${todaysPnl.toFixed(2)}`}
                valueColor={isTodaysPnlPositive ? 'text-green-500' : 'text-red-500'}
            />
            <ProfileStatCard
                icon={<Percent className="w-6 h-6" />}
                title="Win Rate"
                value={winRate} 
                valueColor="text-primary"
            />
        </div>

        <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-transparent p-0 h-auto">
                    <TabsTrigger value="active" className="header-tabs-trigger">Active</TabsTrigger>
                    <TabsTrigger value="closed" className="header-tabs-trigger">Closed</TabsTrigger>
                </TabsList>
            </Tabs>
             <AlertDialog open={isCloseAllDialogOpen} onOpenChange={setIsCloseAllDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={activeSignals.length === 0}>Close All</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Close all active positions?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have {activeSignals.length} open position(s). This will close all of them at market price.
                            The estimated P&L is <span className={cn('font-bold', totalActivePnl >= 0 ? 'text-green-500' : 'text-red-500')}>{totalActivePnl.toFixed(2)} USDT</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCloseAllPositions}>Confirm Close All</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        {activeTab === 'active' && (
            <>
                {/* Active Positions */}
                {activeSignals.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Active Positions ({activeSignals.length})</h3>
                    {activeSignals.map((signal) => (
                    <SignalCard
                        key={signal.id}
                        signal={signal}
                        onAdjustLeverage={() => handleAdjustLeverageClick(signal)}
                        onClosePosition={() => handleClosePositionClick(signal)}
                        onSetTpsl={() => handleSetTpsl(signal)}
                    />
                    ))}
                </div>
                )}

                {/* Pending Signals */}
                {pendingSignals.length > 0 && (
                <div className="space-y-4 pt-6">
                    <h3 className="font-bold text-lg">Pending Signals ({pendingSignals.length})</h3>
                    {pendingSignals.map((signal) => (
                    <PendingSignalCard key={signal.id} signal={signal} onCancel={() => handleCancelPending(signal.id)} />
                    ))}
                </div>
                )}

                {activeSignals.length === 0 && pendingSignals.length === 0 && (
                <div>
                    <Card className="rounded-2xl p-6 text-center text-muted-foreground">
                            <Target className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-semibold">No Active Signals</h3>
                            <p className="mt-1 text-sm">Create a new signal to get started.</p>
                            <Link href={`/create-signal`}>
                                <Button className="mt-4">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Create Signal
                                </Button>
                            </Link>
                    </Card>
                </div>
                )}
            </>
        )}

        {activeTab === 'closed' && (
            <SignalHistory history={signalHistory} onClearHistory={handleClearHistory} />
        )}
        
      </div>
      <AdjustLeverageDialog
        open={isAdjustLeverageOpen}
        onOpenChange={(isOpen) => {
          setIsAdjustLeverageOpen(isOpen);
          if (!isOpen) setSelectedSignal(null);
        }}
        signal={selectedSignal}
        onConfirm={handleLeverageChange}
      />
       <AlertDialog open={isConfirmCloseOpen} onOpenChange={setIsConfirmCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to close this position?</AlertDialogTitle>
            <AlertDialogDescription>
              Closing this {selectedSignal?.ticker} position will result in an estimated P&L of 
              <span className={cn("font-bold", pnlForDialog().isWin ? 'text-green-500' : 'text-red-500')}>
                {` ${pnlForDialog().pnl.toFixed(2)} USDT`}
              </span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSignal(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClosePosition}>
              Confirm Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
