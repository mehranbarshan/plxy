
"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Plus, TrendingDown, TrendingUp, Users } from "lucide-react";

function JournalEntryCard({ tradeType, ticker, date, tags, pnl, pnlPercent, entryPrice, exitPrice, notes, analysis, isWin, isFutures }: {
    tradeType: 'Long' | 'Short';
    ticker: string;
    date: string;
    tags: string[];
    pnl: string;
    pnlPercent: string;
    entryPrice: string;
    exitPrice: string;
    notes: string;
    analysis: string;
    isWin: boolean;
    isFutures: boolean;
}) {
    const colorClass = isWin ? 'text-green-600' : 'text-red-600';
    
    let tradeAction, tradeIcon, tradeIconBg;

    if (isFutures) {
        tradeAction = tradeType;
        tradeIcon = tradeType === 'Long' ? 'L' : 'S';
        tradeIconBg = tradeType === 'Long' ? 'bg-green-500' : 'bg-red-500';
    } else {
        tradeAction = tradeType === 'Long' ? 'Buy' : 'Sell';
        tradeIcon = tradeType === 'Long' ? 'B' : 'S';
        tradeIconBg = tradeType === 'Long' ? 'bg-green-500' : 'bg-red-500';
    }

    return (
        <Card className="rounded-2xl p-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg text-white text-base font-bold", tradeIconBg)}>
                        {tradeIcon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold">{tradeAction} {ticker}</h3>
                           {tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                        </div>
                        <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={cn("font-bold text-lg", colorClass)}>{pnl}</p>
                    <p className={cn("text-sm", colorClass)}>{pnlPercent}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                <div>
                    <p className="text-muted-foreground text-xs">Entry</p>
                    <p className="font-semibold text-base">{entryPrice}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs">Exit</p>
                    <p className="font-semibold text-base">{exitPrice}</p>
                </div>
            </div>

            <div className="space-y-3 text-sm">
                <div>
                    <h4 className="font-semibold">Notes:</h4>
                    <p className="text-muted-foreground">{notes}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Analysis:</h4>
                    <p className="text-muted-foreground">{analysis}</p>
                </div>
            </div>
        </Card>
    )
}


export default function JournalTabContent() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Trading Journal</h2>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                </Button>
            </div>
            <JournalEntryCard 
                tradeType="Long"
                ticker="BTC"
                date="2024-01-29"
                tags={["Futures", "10x"]}
                pnl="+$1,750"
                pnlPercent="+42.2%"
                entryPrice="$42,000"
                exitPrice="$45,100"
                notes="Perfect breakout trade. Strong volume confirmation at entry."
                analysis="Bitcoin broke above key resistance with strong volume. RSI was oversold and MACD showed bullish divergence."
                isWin={true}
                isFutures={true}
            />
            <JournalEntryCard 
                tradeType="Short"
                ticker="SOL"
                date="2024-01-27"
                tags={["Futures", "3x"]}
                pnl="+$196.5"
                pnlPercent="+18.7%"
                entryPrice="$105"
                exitPrice="$98.45"
                notes="Rejection at resistance played out perfectly."
                analysis="SOL rejected at $105 resistance. High volume selling pressure indicated weakness."
                isWin={true}
                isFutures={true}
            />
             <JournalEntryCard
                tradeType="Long"
                ticker="ETH"
                date="2024-01-28"
                tags={["Spot"]}
                pnl="+$130"
                pnlPercent="+5.3%"
                entryPrice="$2,450"
                exitPrice="$2,580"
                notes="Good accumulation zone entry."
                analysis="ETH showing strength against BTC ratio. Good support at $2,400 level."
                isWin={true}
                isFutures={false}
            />
        </div>
    )
}
