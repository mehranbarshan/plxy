
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Pickaxe, Rocket, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import TransferGameFundsDialog from '@/components/tradeview/TransferGameFundsDialog';
import type { MergedCoinData } from '@/types/coin-data';
import { Separator } from '@/components/ui/separator';

const GAME_BALANCE_KEY = 'game_balance';
const GAME_CRYPTO_BALANCES_KEY = 'game_crypto_balances';


const GameCard = ({ title, description, icon, href, isEnabled }: { title: string, description: string, icon: React.ReactNode, href: string, isEnabled: boolean }) => (
    <Link href={isEnabled ? href : '#'} aria-disabled={!isEnabled}>
        <Card className={`rounded-2xl shadow-sm overflow-hidden h-full flex flex-col ${isEnabled ? 'cursor-pointer hover:border-primary/50 transition-all' : 'opacity-60 cursor-not-allowed'}`}>
            <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                    <div className="bg-secondary p-3 rounded-lg text-primary">
                        {icon}
                    </div>
                    <div>
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription className="text-xs">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow flex items-end justify-end">
                <Button variant={isEnabled ? 'default' : 'secondary'} size="sm" className="text-xs">
                    {isEnabled ? 'Play Now' : 'Coming Soon'}
                </Button>
            </CardContent>
        </Card>
    </Link>
)

interface CryptoBalance {
    symbol: string;
    name: string;
    image: string;
    amount: number;
    price: number;
}

export default function GamesTabContent() {
    const [gameBalance, setGameBalance] = useState(0);
    const [cryptoBalances, setCryptoBalances] = useState<CryptoBalance[]>([]);
    const [totalCryptoValue, setTotalCryptoValue] = useState(0);
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    
    const updateBalances = () => {
        const storedBalance = localStorage.getItem(GAME_BALANCE_KEY);
        setGameBalance(storedBalance ? parseFloat(storedBalance) : 0);

        const fetchPricesAndBalances = async () => {
            try {
                const storedCryptoBalances = localStorage.getItem(GAME_CRYPTO_BALANCES_KEY);
                const cryptoAmounts: Record<string, number> = storedCryptoBalances ? JSON.parse(storedCryptoBalances) : {};

                if (Object.keys(cryptoAmounts).length === 0) {
                    setCryptoBalances([]);
                    setTotalCryptoValue(0);
                    return;
                }

                const response = await fetch('/api/all-cryptos');
                if (response.ok) {
                    const data: MergedCoinData[] = await response.json();
                    
                    const newBalances: CryptoBalance[] = [];
                    let newTotalValue = 0;

                    data.forEach(coin => {
                        const amount = cryptoAmounts[coin.symbol.toLowerCase()];
                        if (amount > 0) {
                            const price = parseFloat(coin.lastPrice);
                            newBalances.push({
                                symbol: coin.symbol.toUpperCase(),
                                name: coin.name,
                                image: coin.image,
                                amount: amount,
                                price: price
                            });
                            newTotalValue += amount * price;
                        }
                    });
                    setCryptoBalances(newBalances);
                    setTotalCryptoValue(newTotalValue);
                }
            } catch (error) {
                console.error("Failed to fetch crypto prices for game balances", error);
            }
        };
        fetchPricesAndBalances();
    };

    useEffect(() => {
        updateBalances();
        window.addEventListener('storage', updateBalances);
        return () => window.removeEventListener('storage', updateBalances);
    }, []);

    const totalAssetValue = gameBalance + totalCryptoValue;

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <div className="bg-secondary p-2 rounded-lg">
                            <Wallet className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Game Balance</CardTitle>
                            <CardDescription className="text-xs">Your in-game currency and assets</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">
                        ${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">Total Asset Value</p>
                    
                    <div className="space-y-2 mb-4">
                        {cryptoBalances.map(crypto => (
                             <div key={crypto.symbol} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                     <Image src={crypto.image} alt={crypto.name} width={16} height={16} />
                                    <span className="text-muted-foreground">{crypto.name}</span>
                                </div>
                                <span className="font-semibold">{crypto.amount.toFixed(6)} {crypto.symbol}</span>
                            </div>
                        ))}
                    </div>
                     
                    <Separator className="my-4" />

                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => setIsTransferDialogOpen(true)}>Manage Funds</Button>
                        <Button size="sm" variant="secondary">Rewards</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GameCard 
                    title="Crypto Miner"
                    description="Buy miners and earn passive crypto rewards."
                    icon={<Pickaxe className="w-6 h-6" />}
                    href="/games/miners"
                    isEnabled={true}
                />
                <GameCard 
                    title="Rocket Rider"
                    description="Predict the next market move before the rocket launches."
                    icon={<Rocket className="w-6 h-6" />}
                    href="#"
                    isEnabled={false}
                />
            </div>
             <TransferGameFundsDialog
                open={isTransferDialogOpen}
                onOpenChange={setIsTransferDialogOpen}
                onFundsTransferred={updateBalances}
            />
        </div>
    );
}
