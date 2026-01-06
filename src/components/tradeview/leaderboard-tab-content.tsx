
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal } from 'lucide-react';
import { members as initialMembers, type Member } from '@/lib/member-data';
import { clubs as staticClubs, type Club } from '@/lib/club-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import BadgePreview from './club/badge-preview';

const MEMBERS_KEY = 'tradeview_members';

interface EnrichedMember extends Member {
    club?: Club;
}

const LeaderboardItem = ({ member, rank }: { member: EnrichedMember, rank: number }) => {
    let medal = null;
    if (rank === 1) medal = <Medal className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) medal = <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) medal = <Medal className="w-5 h-5 text-orange-400" />;

    return (
        <Link href={`/trader/${member.id}`} className="block">
            <Card className="p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 text-center flex items-center justify-center">
                        {medal || <span className="font-bold text-sm text-muted-foreground">{rank}</span>}
                    </div>
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-bold text-sm">{member.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {member.club && (
                                <>
                                 <BadgePreview 
                                     icon={member.club.badge.icon}
                                     iconContent={member.club.badge.iconContent}
                                     bgColor={member.club.badge.bgColor}
                                     borderColor={member.club.badge.borderColor}
                                     size={16}
                                 />
                                <span>{member.club.name}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-secondary px-3 py-1.5 rounded-lg">
                        <span className="font-bold">{member.trophies.toLocaleString()}</span>
                        <Trophy className="w-4 h-4 text-yellow-500" />
                    </div>
                </div>
            </Card>
        </Link>
    );
};

const LoadingSkeleton = () => (
    <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
             <Card key={i} className="p-3 rounded-xl">
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-lg" />
                 </div>
             </Card>
        ))}
    </div>
);

export default function LeaderboardTabContent() {
    const [leaderboard, setLeaderboard] = useState<EnrichedMember[]>([]);
    const [loading, setLoading] = useState(true);

    const updateLeaderboard = () => {
        const storedMembers = localStorage.getItem(MEMBERS_KEY);
        const currentMembers: Member[] = storedMembers ? JSON.parse(storedMembers) : initialMembers;
        
        const clubMap = new Map(staticClubs.map(club => [club.id, club]));

        const enrichedMembers: EnrichedMember[] = currentMembers
            .map(member => ({
                ...member,
                club: member.clubId ? clubMap.get(member.clubId) as Club : undefined,
            }))
            .sort((a, b) => b.trophies - a.trophies);
        
        setLeaderboard(enrichedMembers);
        setLoading(false);
    };
    
    useEffect(() => {
        updateLeaderboard(); // Initial load

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === MEMBERS_KEY) {
                updateLeaderboard();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="space-y-3">
            {leaderboard.map((member, index) => (
                <LeaderboardItem key={member.id} member={member} rank={index + 1} />
            ))}
        </div>
    );
}
