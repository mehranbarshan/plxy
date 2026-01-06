

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Star } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { clubs as staticClubs, type Club } from '@/lib/club-data';
import { members as initialMembers, type Member } from '@/lib/member-data';
import { useState, useEffect } from 'react';
import BadgePreview from "./club/badge-preview";


interface TradingClubProps {
  count: number;
  current: number;
  scrollTo: (index: number) => void;
}

export default function TradingClub({ count, current, scrollTo }: TradingClubProps) {
    const [topClubs, setTopClubs] = useState<Club[]>([]);
    
    useEffect(() => {
        const storedMembers = localStorage.getItem('tradeview_members');
        const currentMembers: Member[] = storedMembers ? JSON.parse(storedMembers) : initialMembers;

        const dynamicClubs: Club[] = staticClubs.map(club => {
            const clubMembers = currentMembers.filter((member: Member) => member.clubId === club.id);
            const totalTrophies = clubMembers.reduce((sum: number, member: Member) => sum + member.trophies, 0);
            return {
                ...club,
                trophies: totalTrophies,
                members: clubMembers.length,
            };
        });

        const sortedClubs = [...dynamicClubs].sort((a,b) => b.trophies - a.trophies);
        setTopClubs(sortedClubs.slice(0, 3));
    }, []);


  return (
    <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-lg">Star Trading Clubs</h3>
        </div>
        <p className="text-sm text-primary-foreground/80 mt-1">Join top clubs and compete for rewards.</p>

        <div className="space-y-3 my-4">
            {topClubs.map((club, index) => (
                <div key={club.id} className="flex items-center justify-between bg-white/10 p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                            {index + 1}
                        </div>
                        <BadgePreview 
                            icon={club.badge.icon}
                            iconContent={club.badge.iconContent}
                            bgColor={club.badge.bgColor}
                            borderColor={club.badge.borderColor}
                            size={32}
                        />
                        <div>
                            <p className="font-semibold text-sm">{club.name}</p>
                            <p className="text-xs text-primary-foreground/80">{club.members} Members</p>
                        </div>
                    </div>
                    <Link href={`/club/${club.id}`}>
                        <Button size="sm" variant="secondary" className="h-8 text-xs">Join</Button>
                    </Link>
                </div>
            ))}
        </div>
        <div className="flex-grow" />
         <div className="flex justify-center gap-2 pt-4">
            {Array.from({ length: count }).map((_, index) => (
                <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                    "h-2 w-2 rounded-full transition-all bg-white/50",
                    current === index ? "w-4 bg-white" : "hover:bg-white/75"
                )}
                />
            ))}
        </div>
    </CardContent>
  );
}
