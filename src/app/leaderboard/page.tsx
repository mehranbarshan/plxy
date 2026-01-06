
"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Medal, Trophy, Star, Gift, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import BottomNav from '@/components/tradeview/bottom-nav';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function TournamentPageContent() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 12,
    minutes: 10,
    seconds: 53,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let { days, hours, minutes, seconds } = prevTime;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          seconds = 59;
          minutes--;
        } else if (hours > 0) {
          seconds = 59;
          minutes = 59;
          hours--;
        } else if (days > 0) {
          seconds = 59;
          minutes = 59;
          hours = 23;
          days--;
        } else {
          clearInterval(timer);
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const rewards = [
    { rank: "1", prizes: [{ icon: "/Plxy-coin.png", text: "1K" }, { icon: "/experience-icon.png", text: "500 exp" }, { icon: "/P-char.png", text: "Avatar" }, { icon: "/Money.png", text: "$100K" }] },
    { rank: "2", prizes: [{ icon: "/Plxy-coin.png", text: "750" }, { icon: "/experience-icon.png", text: "300 exp" }, { icon: "/images/avatar-boy.png", text: "Avatar" }, { icon: "/Money.png", text: "$75K" }] },
    { rank: "3", prizes: [{ icon: "/Plxy-coin.png", text: "500" }, { icon: "/experience-icon.png", text: "100 exp" }, { icon: "/images/avatar-lobster.png", text: "Avatar" }, { icon: "/Money.png", text: "$50K" }] },
    { rank: "TOP 20", prizes: [{ icon: "/Plxy-coin.png", text: "250" }, { icon: "/experience-icon.png", text: "50 exp" }, { icon: "/Money.png", text: "$25K" }] },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      
      <main className="flex-grow container mx-auto max-w-2xl p-4 pt-2 pb-20 space-y-3">
        <div className="text-center text-xs text-muted-foreground py-1">
            Tournament ends in <span className="text-primary font-semibold">{timeLeft.days}d {formatTime(timeLeft.hours)}h {formatTime(timeLeft.minutes)}m {formatTime(timeLeft.seconds)}s</span>
        </div>
        
        <Card className="rounded-xl p-3 flex items-center justify-between shadow-sm">
            <p className="font-semibold text-sm">Participation reward</p>
            <div className="flex items-center gap-2 font-bold text-sm">
                <span>10</span>
                <Image src="/Plxy-coin.png" alt="Coin" width={20} height={20} data-ai-hint="gold coin" />
            </div>
        </Card>

        <Button size="lg" className="w-full h-12 text-sm font-bold bg-green-500 hover:bg-green-600 text-white rounded-full">
            Join tournament
            <span className="ml-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">AD</span>
        </Button>

        <div className="space-y-3">
            <h2 className="text-base font-bold text-center">Tournament trophies</h2>
             {rewards.map(reward => (
                <div key={reward.rank} className="rounded-xl p-3">
                    <CardHeader className="p-0 mb-2">
                        <CardTitle className="text-sm font-bold flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1.5" />
                            Rank {reward.rank}
                        </CardTitle>
                    </CardHeader>
                      <div className="grid grid-cols-4 gap-2">
                          {reward.prizes.map(prize => (
                               <div key={prize.text} className="bg-secondary p-2 rounded-lg flex flex-col items-center justify-center text-center aspect-square">
                                  <Image src={prize.icon} alt={prize.text} width={28} height={28} className="mb-1" data-ai-hint="game asset" />
                                  <span className="text-[10px] font-semibold leading-tight">{prize.text}</span>
                              </div>
                          ))}
                      </div>
                </div>
            ))}
        </div>
      </main>
      <div className="sticky bottom-0">
        <BottomNav />
      </div>
    </div>
  );
}


export default function LeaderboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TournamentPageContent />
        </Suspense>
    )
}
