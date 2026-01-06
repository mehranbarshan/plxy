
"use client"

import { useState, useEffect, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Club } from '@/lib/club-data';
import { members as initialMembers, type Member } from '@/lib/member-data';
import MyClubView from '@/components/tradeview/club/my-club-view';
import JoinClubForm from '@/components/tradeview/club/join-club-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const USERNAME_KEY = 'tradeview_username';
const MEMBERS_KEY = 'tradeview_members';

function LoadingSkeleton() {
    return <div>Loading...</div>;
}

function ClubPageContent() {
    const [userClub, setUserClub] = useState<Club | null>(null);
    const [hasClub, setHasClub] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const username = localStorage.getItem(USERNAME_KEY);
        const storedMembers = localStorage.getItem(MEMBERS_KEY);
        const currentMembers: Member[] = storedMembers ? JSON.parse(storedMembers) : initialMembers;
        
        const currentUser = currentMembers.find(m => m.name === username);
        
        if (currentUser && currentUser.clubId) {
            const clubModule = require('@/lib/club-data');
            const clubData = clubModule.getClubById(currentUser.clubId, currentMembers);
            if (clubData) {
                setUserClub(clubData);
                setHasClub(true);
            }
        } else {
            setHasClub(false);
        }
        setIsLoading(false);
    }, []);

    const handleLeaveClub = () => {
        const username = localStorage.getItem(USERNAME_KEY);
        if (!username || !userClub) return;

        const storedMembers = localStorage.getItem(MEMBERS_KEY);
        const currentMembers: Member[] = storedMembers ? JSON.parse(storedMembers) : [];
        
        const updatedMembers = currentMembers.filter(m => !(m.name === username && m.clubId === userClub.id));

        localStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedMembers));
        
        toast({
            title: `You have left ${userClub.name}`,
        });

        setUserClub(null);
        setHasClub(false);
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-grow">
                    {!hasClub && (
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search for a club..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}
                </div>
                 {!hasClub && (
                    <Button onClick={() => router.push('/club/create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create
                    </Button>
                )}
            </header>
            <main className="flex-grow container mx-auto max-w-2xl px-4 pb-4 flex flex-col">
                {hasClub && userClub ? (
                    <MyClubView club={userClub} onLeave={handleLeaveClub} />
                ) : (
                    <JoinClubForm userHasClub={false} searchQuery={searchQuery} />
                )}
            </main>
        </div>
    );
}

export default function ClubPage() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <ClubPageContent />
        </Suspense>
    )
}
