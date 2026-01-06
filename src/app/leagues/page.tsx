
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Member } from '@/lib/member-data';

const USERNAME_KEY = 'tradeview_username';
const MEMBERS_KEY = 'tradeview_members';

const leagueLevels = [
    { name: 'Bronze', trophies: 400, color: 'text-orange-400', bgColor: 'bg-orange-400/10', borderColor: 'border-orange-400/20' },
    { name: 'Silver', trophies: 800, color: 'text-gray-400', bgColor: 'bg-gray-400/10', borderColor: 'border-gray-400/20' },
    { name: 'Gold', trophies: 1400, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/20' },
    { name: 'Crystal', trophies: 2000, color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/20' },
    { name: 'Master', trophies: 2600, color: 'text-indigo-400', bgColor: 'bg-indigo-400/10', borderColor: 'border-indigo-400/20' },
    { name: 'Champion', trophies: 3200, color: 'text-red-400', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/20' },
    { name: 'Titan', trophies: 4100, color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/20' },
];

const LeagueCard = ({ league, isCurrent, isNext }: { league: typeof leagueLevels[0], isCurrent: boolean, isNext: boolean }) => {
    return (
        <Card className={cn(
            "p-4 rounded-xl flex items-center gap-4 transition-all",
            isCurrent ? 'border-primary/50 bg-primary/10 shadow-lg scale-105' : 'bg-secondary/50',
            isNext && !isCurrent ? 'border-dashed' : ''
        )}>
            <div className={cn("p-4 rounded-lg", league.bgColor)}>
                <Shield className={cn("w-8 h-8", league.color)} />
            </div>
            <div className="flex-grow">
                <h3 className={cn("text-lg font-bold", isCurrent ? 'text-primary' : '')}>{league.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{league.trophies.toLocaleString()}+ Trophies</span>
                </p>
            </div>
             {isCurrent && <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded-full">Current</span>}
        </Card>
    );
};

export default function LeaguesPage() {
    const router = useRouter();
    const [userTrophies, setUserTrophies] = useState(0);

    useEffect(() => {
        const username = localStorage.getItem(USERNAME_KEY);
        const membersRaw = localStorage.getItem(MEMBERS_KEY);
        if (username && membersRaw) {
            try {
                const members: Member[] = JSON.parse(membersRaw);
                const currentUser = members.find(m => m.name === username);
                if (currentUser) {
                    setUserTrophies(currentUser.trophies);
                }
            } catch(e) {
                console.error("Failed to parse members data", e)
            }
        }
    }, []);

    const getCurrentLeagueIndex = () => {
        let currentLeagueIdx = -1;
        for (let i = 0; i < leagueLevels.length; i++) {
            if (userTrophies >= leagueLevels[i].trophies) {
                currentLeagueIdx = i;
            } else {
                break;
            }
        }
        return currentLeagueIdx;
    };

    const currentLeagueIndex = getCurrentLeagueIndex();

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-bold">League Levels</h1>
            </header>
            <main className="flex-grow container mx-auto max-w-2xl p-4 pt-0 pb-20 space-y-3">
                {leagueLevels.map((league, index) => (
                    <LeagueCard 
                        key={league.name} 
                        league={league} 
                        isCurrent={index === currentLeagueIndex}
                        isNext={index === currentLeagueIndex + 1}
                    />
                )).reverse()}
            </main>
        </div>
    );
}
