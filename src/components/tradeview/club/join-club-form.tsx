
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Users, Trophy, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import BadgePreview from '@/components/tradeview/club/badge-preview';
import { clubs as staticClubs, type Club } from '@/lib/club-data';
import { members as initialMembers, type Member } from '@/lib/member-data';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

const MEMBERS_KEY = 'tradeview_members';


const ClubTypeBadge = ({ type }: { type: Club['type'] }) => {
    let text;
    let className;
    switch (type) {
        case 'open':
            text = 'Anyone can join';
            className = 'text-green-500';
            break;
        case 'invite':
            text = 'Invite only';
            className = 'text-yellow-500';
            break;
        case 'closed':
            text = 'Closed';
            className = 'text-red-500';
            break;
    }
    return <p className={cn("text-xs", className)}>{text}</p>;
};

const ClubListItem = ({ club, userHasClub }: { club: Club, userHasClub: boolean }) => (
    <Link href={`/club/${club.id}`} className="block">
        <Card className="p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <BadgePreview 
                        icon={club.badge.icon}
                        iconContent={club.badge.iconContent}
                        bgColor={club.badge.bgColor}
                        borderColor={club.badge.borderColor}
                        size={48}
                    />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold">{club.name}</h3>
                    <ClubTypeBadge type={club.type} />
                </div>
                <div className="flex-shrink-0 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{club.members}/{club.maxMembers}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-sm mt-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{(club.trophies || 0).toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <Button size="sm" disabled={club.type === 'closed' || userHasClub}>
                        {club.type === 'closed' ? <Lock className="w-4 h-4"/> : 'Join'}
                    </Button>
                </div>
            </div>
        </Card>
    </Link>
);

export default function JoinClubForm({ userHasClub, searchQuery }: { userHasClub: boolean, searchQuery: string }) {
  const [searchResults, setSearchResults] = useState<Club[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>(initialMembers);

  useEffect(() => {
    const storedMembers = localStorage.getItem(MEMBERS_KEY);
    const currentMembers = storedMembers ? JSON.parse(storedMembers) : initialMembers;
    setAllMembers(currentMembers);
  }, []);

  useEffect(() => {
    const dynamicClubs: Club[] = staticClubs.map(club => {
        const clubMembers = allMembers.filter((member: Member) => member.clubId === club.id);
        const totalTrophies = clubMembers.reduce((sum: number, member: Member) => sum + member.trophies, 0);
        return {
            ...club,
            trophies: totalTrophies,
            members: clubMembers.length,
        };
    });
      
    if (searchQuery.trim() === '') {
        setSearchResults(dynamicClubs);
        return;
    }

    const filteredClubs = dynamicClubs.filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredClubs);
  }, [searchQuery, allMembers]);


  return (
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-grow min-h-0">
            <div className="space-y-3">
                {searchResults.length > 0 ? (
                    searchResults.map(club => <ClubListItem key={club.id} club={club} userHasClub={userHasClub} />)
                ) : (
                    <Card className="p-6 text-center text-muted-foreground">
                        No clubs found for "{searchQuery}".
                    </Card>
                )}
            </div>
        </ScrollArea>
      </div>
  );
}
