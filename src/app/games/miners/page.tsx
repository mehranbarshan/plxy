
"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Rocket, Swords, Trophy, Wallet, Zap, Plus, Minus, Server, Clock, Gift, Loader2, ArrowLeft, Pickaxe } from 'lucide-react';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import type { MergedCoinData } from '@/types/coin-data';
import { Skeleton } from '@/components/ui/skeleton';
import TransferGameFundsDialog from '@/components/tradeview/TransferGameFundsDialog';
import { useRouter } from 'next/navigation';


const GAME_BALANCE_KEY = 'game_balance';
const OWNED_MINERS_KEY = 'owned_miners';
const CLAIM_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours
const GAME_CRYPTO_BALANCES_KEY = 'game_crypto_balances';


interface Miner {
    id: string;
    name: string;
    cryptoSymbol: string;
    cryptoId: string; // This should match the id from CoinGecko API (e.g., 'bitcoin')
    cryptoImage: string;
    miningRatePerHour: number; // e.g. 0.0001 BTC per hour
}

interface OwnedMiner {
    instanceId: number; // Unique ID for this specific miner instance
    minerId: string;
    purchaseTimestamp: number;
    lastClaimTimestamp: number;
}

const availableMiners: Miner[] = [
    {
        id: 'btc-s1',
        name: 'Bitcoin Miner S1',
        cryptoSymbol: 'BTC',
        cryptoId: 'bitcoin',
        cryptoImage: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        miningRatePerHour: 0.00002,
    },
    {
        id: 'eth-e1',
        name: 'Ether Extractor E1',
        cryptoSymbol: 'ETH',
        cryptoId: 'ethereum',
        cryptoImage: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        miningRatePerHour: 0.0003,
    },
     {
        id: 'sol-x1',
        name: 'Solana Sol-X1',
        cryptoSymbol: 'SOL',
        cryptoId: 'solana',
        cryptoImage: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        miningRatePerHour: 0.01,
    }
];

const MinerStoreItem = ({ miner, price, onBuy, canAfford, isOwned }: { miner: Miner, price: number | undefined, onBuy: (minerId: string) => void, canAfford: boolean, isOwned: boolean }) => (
    <Card className="rounded-xl overflow-hidden">
        <CardHeader className="p-4">
            <div className="flex items-center gap-3">
                 <Image src={miner.cryptoImage} alt={miner.name} width={40} height={40} />
                 <div>
                    <CardTitle className="text-base">{miner.name}</CardTitle>
                    <CardDescription className="text-xs">{`Mines ${miner.cryptoSymbol}`}</CardDescription>
                 </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Price (USD Value)</span>
                {price !== undefined ? (
                    <span className="font-bold">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                ) : (
                    <Skeleton className="h-5 w-20" />
                )}
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-bold">{miner.miningRatePerHour} {miner.cryptoSymbol}/hr</span>
            </div>
             <Button className="w-full" onClick={() => onBuy(miner.id)} disabled={!canAfford || price === undefined || isOwned}>
                {isOwned ? "Owned" : (price === undefined ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />)}
                {isOwned ? "" : "Buy Miner"}
            </Button>
        </CardContent>
    </Card>
);

const OwnedMinerItem = ({ ownedMiner, minerInfo, onClaim }: { ownedMiner: OwnedMiner, minerInfo: Miner, onClaim: (instanceId: number, amount: number, cryptoSymbol: string) => void }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const timeSinceLastClaim = now - ownedMiner.lastClaimTimestamp;
    const isClaimable = timeSinceLastClaim >= CLAIM_INTERVAL_MS;
    
    const minedAmount = useMemo(() => {
        const durationHours = Math.min(timeSinceLastClaim, CLAIM_INTERVAL_MS) / (1000 * 60 * 60);
        return durationHours * minerInfo.miningRatePerHour;
    }, [timeSinceLastClaim, minerInfo.miningRatePerHour]);
    
    const progress = isClaimable ? 100 : (timeSinceLastClaim / CLAIM_INTERVAL_MS) * 100;
    
    const timeToClaim = useMemo(() => {
        if (isClaimable) return "Ready to Claim";
        const remainingMs = CLAIM_INTERVAL_MS - timeSinceLastClaim;
        const hours = Math.floor(remainingMs / (3600 * 1000));
        const minutes = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
        return `Claim in ${hours}h ${minutes}m`;
    }, [isClaimable, timeSinceLastClaim]);


    return (
        <Card className={cn("rounded-xl p-4", isClaimable ? "border-primary" : "")}>
            <div className="flex items-center gap-4 mb-4">
                <Image src={minerInfo.cryptoImage} alt={minerInfo.name} width={32} height={32} />
                <div>
                    <h4 className="font-semibold text-sm">{minerInfo.name}</h4>
                    <p className="text-xs text-muted-foreground">Mining {minerInfo.cryptoSymbol}</p>
                </div>
            </div>
            <div className="space-y-3">
                 <div className="text-center">
                    <p className="text-xs text-muted-foreground">Mined Amount</p>
                    <p className="text-lg font-bold">{minedAmount.toFixed(6)} {minerInfo.cryptoSymbol}</p>
                </div>
                <div>
                     <Progress value={progress} indicatorClassName={isClaimable ? "bg-primary" : "bg-foreground"} />
                     <p className="text-xs text-center text-muted-foreground mt-1.5">{timeToClaim}</p>
                </div>
                <Button 
                    className="w-full" 
                    disabled={!isClaimable}
                    onClick={() => onClaim(ownedMiner.instanceId, minedAmount, minerInfo.cryptoSymbol)}
                >
                    <Gift className="w-4 h-4 mr-2" />
                    Claim
                </Button>
            </div>
        </Card>
    );
};


export default function MinersPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [gameBalance, setGameBalance] = useState(0);
    const [ownedMiners, setOwnedMiners] = useState<OwnedMiner[]>([]);
    const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
    
    useEffect(() => {
        const fetchInitialData = () => {
            const storedBalance = localStorage.getItem(GAME_BALANCE_KEY);
            setGameBalance(storedBalance ? parseFloat(storedBalance) : 0);

            const storedMiners = localStorage.getItem(OWNED_MINERS_KEY);
            setOwnedMiners(storedMiners ? JSON.parse(storedMiners) : []);
        };

        fetchInitialData();

        const fetchPrices = async () => {
            try {
                const response = await fetch('/api/all-cryptos');
                if (response.ok) {
                    const data: MergedCoinData[] = await response.json();
                    const priceMap = data.reduce((acc, coin) => {
                        acc[coin.id] = parseFloat(coin.lastPrice);
                        return acc;
                    }, {} as Record<string, number>);
                    setCryptoPrices(priceMap);
                }
            } catch (error) {
                console.error("Failed to fetch crypto prices for miners", error);
            }
        };
        
        fetchPrices();
        const interval = setInterval(fetchPrices, 10000); // Fetch every 10 seconds
        return () => clearInterval(interval);

    }, []);

    const handleBuyMiner = (minerId: string) => {
        const minerToBuy = availableMiners.find(m => m.id === minerId);
        if (!minerToBuy) {
            toast({ variant: 'destructive', title: 'Error', description: 'Miner not found.' });
            return;
        }

        const ownedMinerIds = ownedMiners.map(om => availableMiners.find(am => am.id === om.minerId)?.cryptoId);
        if (ownedMinerIds.includes(minerToBuy.cryptoId)) {
            toast({ variant: 'destructive', title: 'Already Owned', description: `You can only own one ${minerToBuy.cryptoSymbol} miner.` });
            return;
        }

        const minerPrice = cryptoPrices[minerToBuy.cryptoId];
        if (minerPrice === undefined) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not determine miner price. Please try again.' });
            return;
        }
        
        const currentUSDBalance = parseFloat(localStorage.getItem(GAME_BALANCE_KEY) || '0');
        if (currentUSDBalance < minerPrice) {
            toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'You do not have enough game balance (USD) to buy this miner.' });
            return;
        }
        
        const newUSDBalance = currentUSDBalance - minerPrice;

        const now = Date.now();
        const newMinerInstance: OwnedMiner = {
            instanceId: now,
            minerId: minerId,
            purchaseTimestamp: now,
            lastClaimTimestamp: now
        };

        const newOwnedMiners = [...ownedMiners, newMinerInstance];

        setGameBalance(newUSDBalance);
        setOwnedMiners(newOwnedMiners);

        localStorage.setItem(GAME_BALANCE_KEY, newUSDBalance.toString());
        localStorage.setItem(OWNED_MINERS_KEY, JSON.stringify(newOwnedMiners));

        toast({ title: 'Purchase Successful', description: `You have bought a ${minerToBuy.name}!` });
    };
    
    const handleClaim = (instanceId: number, amount: number, cryptoSymbol: string) => {
        const storedBalances = localStorage.getItem(GAME_CRYPTO_BALANCES_KEY);
        const currentBalances = storedBalances ? JSON.parse(storedBalances) : {};
        
        const lowerCaseSymbol = cryptoSymbol.toLowerCase();
        const currentCryptoBalance = currentBalances[lowerCaseSymbol] || 0;
        const newCryptoBalance = currentCryptoBalance + amount;
        
        const newBalances = { ...currentBalances, [lowerCaseSymbol]: newCryptoBalance };
        localStorage.setItem(GAME_CRYPTO_BALANCES_KEY, JSON.stringify(newBalances));

        const now = Date.now();
        const updatedMiners = ownedMiners.map(m =>
            m.instanceId === instanceId ? { ...m, lastClaimTimestamp: now } : m
        );
        
        setOwnedMiners(updatedMiners);
        localStorage.setItem(OWNED_MINERS_KEY, JSON.stringify(updatedMiners));

        toast({
            title: 'Claim Successful',
            description: `You claimed ${amount.toFixed(6)} ${cryptoSymbol}!`
        });
        window.dispatchEvent(new Event('storage'));
    };
    
    const ownedMinerCryptoIds = useMemo(() => {
        return ownedMiners.map(om => availableMiners.find(am => am.id === om.minerId)?.cryptoId);
    }, [ownedMiners]);

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <div className="bg-secondary p-2 rounded-lg text-primary">
                        <Pickaxe className="w-5 h-5" />
                    </div>
                    <h1 className="text-lg font-bold">Crypto Miners</h1>
                </div>
            </header>
            <main className="flex-grow container mx-auto max-w-2xl p-4 pt-0 pb-4 space-y-6">

                <section className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Server className="w-5 h-5 text-muted-foreground" />
                        My Miners ({ownedMiners.length})
                    </h2>

                    {ownedMiners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {ownedMiners.map(om => {
                               const minerInfo = availableMiners.find(m => m.id === om.minerId);
                               if (!minerInfo) return null;
                               return <OwnedMinerItem key={om.instanceId} ownedMiner={om} minerInfo={minerInfo} onClaim={handleClaim} />
                           })}
                       </div>
                    ) : (
                        <Card className="rounded-2xl p-6 text-center text-muted-foreground border-dashed">
                            You don't own any miners yet. Visit the store to buy one!
                        </Card>
                    )}
                </section>
                
                <Separator />

                <section className="space-y-4">
                     <h2 className="text-xl font-bold flex items-center gap-2">
                        <Server className="w-5 h-5 text-muted-foreground" />
                        Miner Store
                    </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableMiners.map(miner => (
                            <MinerStoreItem 
                                key={miner.id} 
                                miner={miner}
                                price={cryptoPrices[miner.cryptoId]}
                                onBuy={handleBuyMiner}
                                canAfford={gameBalance >= (cryptoPrices[miner.cryptoId] || Infinity)}
                                isOwned={ownedMinerCryptoIds.includes(miner.cryptoId)}
                            />
                        ))}
                     </div>
                </section>
                
            </main>
        </div>
    );
}

    