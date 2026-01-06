
"use client"

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Coins, BookOpen, Wallet, ArrowRightLeft, Zap } from "lucide-react"
import { Button } from "../ui/button"
import Image from 'next/image';
import Link from 'next/link';
import type { Signal } from '@/lib/types';

const FUTURES_BALANCE_KEY = 'tradeview_demo_balance';
const USERNAME_KEY = 'tradeview_username';
const AVATAR_KEY = 'tradeview_avatar';
const SIGNALS_KEY = 'tradeview_my_signals';

interface FuturesHeaderProps {
    showBalance?: boolean;
}


export default function FuturesHeader({ showBalance = true }: FuturesHeaderProps) {
    const [futuresBalance, setFuturesBalance] = useState(10000);
    const [username, setUsername] = useState('U');
    const [avatar, setAvatar] = useState("https://asset.gaminvest.org/asset/social-trading/profile.png");
    const [activeTradesCount, setActiveTradesCount] = useState(0);


    useEffect(() => {
        const updateBalance = () => {
            const storedBalance = localStorage.getItem(FUTURES_BALANCE_KEY);
            setFuturesBalance(storedBalance ? parseFloat(storedBalance) : 10000);
        }

        const updateActiveTradesCount = () => {
            const storedSignals = localStorage.getItem(SIGNALS_KEY);
            if (storedSignals) {
                try {
                    const signals: Signal[] = JSON.parse(storedSignals);
                    const activeSignals = signals.filter(s => s.status === 'active');
                    setActiveTradesCount(activeSignals.length);
                } catch (e) {
                    console.error("Failed to parse signals from localStorage", e);
                    setActiveTradesCount(0);
                }
            } else {
                setActiveTradesCount(0);
            }
        };

        updateBalance();
        updateActiveTradesCount();

        const handleStorageChange = (e: StorageEvent) => {
             const newUsername = localStorage.getItem(USERNAME_KEY);
             if(newUsername) setUsername(newUsername);
             const newAvatar = localStorage.getItem(AVATAR_KEY);
             if(newAvatar) setAvatar(newAvatar);
             if (e.key === SIGNALS_KEY) {
                updateActiveTradesCount();
             }
        }
        
        window.addEventListener('balanceUpdated', updateBalance);
        window.addEventListener('storage', handleStorageChange);


        return () => {
            window.removeEventListener('balanceUpdated', updateBalance);
            window.removeEventListener('storage', handleStorageChange);
        }
    }, []);

    const formatBalance = (balance: number) => {
        if (balance >= 1000) {
            return `$${'\'\'\''}${(balance / 1000).toFixed(2)}k`;
        }
        return `$${'\'\'\''}${balance.toFixed(2)}`;
    }

    return (
        <div className="rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-4">
                 <Link href="/profile">
                    <Avatar className="w-12 h-12 cursor-pointer">
                        <AvatarImage src={avatar} alt={username} data-ai-hint="man portrait" />
                        <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-grow space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 font-semibold">
                            <Image src="/Money.png" alt="Money" width={16} height={16} />
                            <span>$19.70K</span>
                        </div>
                        <div className="w-px h-4 bg-muted-foreground/20"></div>
                        <div className="flex items-center gap-1.5 font-semibold">
                            <Image src="/Plxy-coin.png" alt="Plxy Coin" width={21} height={21} />
                            <span>165</span>
                        </div>
                        <div className="w-px h-4 bg-muted-foreground/20"></div>
                        <div className="flex items-center gap-1.5 font-semibold">
                            <Image src="/experience-icon.png" alt="Experience" width={16} height={16} />
                            <span>500</span>
                        </div>
                         <div className="w-px h-4 bg-muted-foreground/20"></div>
                         <div className="flex-shrink-0">
                            <Link href="/tasks">
                                <div className="bg-blue-500/20 p-2 rounded-full cursor-pointer">
                                    <Zap className="w-[18px] h-[18px] text-blue-500" />
                                </div>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-muted-foreground">Lvl 4</p>
                        <Progress value={60} className="h-1 w-24 shadow-md" indicatorClassName="bg-green-500" />
                    </div>
                </div>
            </div>
             {showBalance && (
                <div className="flex items-center gap-2">
                    <div className="flex-grow flex items-center justify-between gap-2 bg-background/50 rounded-lg p-1 border shadow-sm">
                        <div className="flex items-center gap-2 pl-2">
                          <Wallet className="w-4 h-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Available: <span className="font-semibold text-foreground">{formatBalance(futuresBalance)}</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                             <a href="/my-signals" className="w-auto">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-7 w-auto px-3 text-xs flex items-center gap-2">
                                    <ArrowRightLeft className="w-3 h-3" />
                                    Trades
                                    <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                        {activeTradesCount}
                                    </span>
                                </Button>
                             </a>
                        </div>
                    </div>
                    <a href="/learn">
                        <Button variant="secondary" size="icon" className="h-9 w-9">
                            <BookOpen className="w-5 h-5" />
                        </Button>
                    </a>
                </div>
            )}
        </div>
    )
}
