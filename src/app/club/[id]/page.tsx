
"use client"

import { useParams, useRouter } from "next/navigation"
import { getClubById } from "@/lib/club-data"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Trophy, Lock, ShieldQuestion, Info, Globe, Calendar, Swords, MessageSquare, ChevronDown, Trash2 } from "lucide-react"
import AppHeader from "@/components/tradeview/app-header"
import BadgePreview from "@/components/tradeview/club/badge-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { members as initialMembersData, type Member } from "@/lib/member-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Club } from "@/lib/club-data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const MemberListItem = ({ member, rank, isOwner, onRemove, isSelf }: { member: Member, rank: number, isOwner: boolean, onRemove: (memberId: string) => void, isSelf: boolean }) => {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
            <div className="w-8 text-center text-muted-foreground font-semibold">{rank}</div>
            <Avatar className="w-10 h-10">
                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person portrait" />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <p className="font-semibold text-sm">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-bold">{member.trophies.toLocaleString()}</span>
            </div>
            {isOwner && !isSelf && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to remove this member from the club? They will have to rejoin if they want to come back.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onRemove(member.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                Yes, Remove
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}

const USERNAME_KEY = 'tradeview_username';
const MEMBERS_KEY = 'tradeview_members';


export default function ClubDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const clubId = params.id as string
    const { toast } = useToast();
    
    const [club, setClub] = useState<Club | null>(null);

    const [isOwner, setIsOwner] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [clubMembers, setClubMembers] = useState<Member[]>([]);
    const [username, setUsername] = useState('');
    const [allMembers, setAllMembers] = useState<Member[]>(initialMembersData);


     useEffect(() => {
        const storedUsername = localStorage.getItem(USERNAME_KEY);
        const storedMembers = localStorage.getItem(MEMBERS_KEY);
        const currentMembers = storedMembers ? JSON.parse(storedMembers) : initialMembersData;
        setAllMembers(currentMembers);

        const dynamicClub = getClubById(clubId, currentMembers);
        if (dynamicClub) {
            setClub(dynamicClub);
            const currentClubMembers = currentMembers.filter((m: Member) => m.clubId === clubId);
            setClubMembers(currentClubMembers);

            if (storedUsername) {
                setUsername(storedUsername);
                const owner = currentClubMembers.find((m: Member) => m.role === 'Owner');
                if (owner && owner.name === storedUsername) {
                    setIsOwner(true);
                } else {
                    setIsOwner(false);
                }
                if (currentClubMembers.some((m: Member) => m.name === storedUsername)) {
                    setIsMember(true);
                } else {
                    setIsMember(false);
                }
            }
        }
    }, [clubId]);


    const handleJoin = () => {
        if (!username || !club) return;
        
        const newUserAsMember: Member = {
            id: `user-${Date.now()}`,
            clubId: club.id,
            name: username,
            role: 'Member',
            trophies: 0,
            avatar: 'https://picsum.photos/seed/1/100/100'
        };

        const updatedAllMembers = [...allMembers, newUserAsMember];
        setAllMembers(updatedAllMembers);
        setClubMembers(prev => [...prev, newUserAsMember]);
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedAllMembers));

        setIsMember(true);
        toast({
            title: `Welcome to ${club.name}!`,
            description: "You have successfully joined the club.",
        });
        router.push('/club');
    };
    
    const handleLeave = () => {
        if (!username || !club) return;

        const updatedAllMembers = allMembers.filter(m => m.name !== username || m.clubId !== club.id);
        setAllMembers(updatedAllMembers);
        setClubMembers(prev => prev.filter(m => m.name !== username));
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedAllMembers));

        setIsMember(false);
        toast({
            variant: "destructive",
            title: `You have left ${club.name}`,
        });
    };

    const handleRemoveMember = (memberId: string) => {
        const memberToRemove = allMembers.find(m => m.id === memberId);
        if (!memberToRemove) return;

        const updatedAllMembers = allMembers.filter(m => m.id !== memberId);
        setAllMembers(updatedAllMembers);
        setClubMembers(prev => prev.filter(m => m.id !== memberId));
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedAllMembers));

        toast({
            variant: 'destructive',
            title: `${memberToRemove.name} has been removed from the club.`
        });
    };
    
    const handleJoinLeaveClick = () => {
        if (isMember) {
            handleLeave();
        } else {
            handleJoin();
        }
    };


    if (!club) {
        return (
             <div className="flex flex-col min-h-screen bg-background font-body items-center justify-center">
                <p>Loading club details...</p>
            </div>
        )
    }
    
    const stats = [
        { icon: <Trophy className="w-5 h-5" />, label: 'Total Trophies', value: club.trophies.toLocaleString() },
        { icon: <Users className="w-5 h-5" />, label: 'Members', value: `${clubMembers.length}/${club.maxMembers}` },
        { icon: <Trophy className="w-5 h-5" />, label: 'Required Trophies', value: club.requiredTrophies.toLocaleString() },
        { icon: <ShieldQuestion className="w-5 h-5" />, label: 'Type', value: club.type.charAt(0).toUpperCase() + club.type.slice(1) },
        { icon: <Swords className="w-5 h-5" />, label: 'Competition Frequency', value: 'Once a week' },
        { icon: <Globe className="w-5 h-5" />, label: 'Location', value: club.location || 'International' },
    ];

    const getJoinButtonState = () => {
        if (isMember) {
            return { text: 'Leave', variant: 'destructive', disabled: false };
        }
        if (club.type === 'closed') {
            return { text: 'Club is Closed', variant: 'secondary', disabled: true };
        }
        return { text: 'Join', variant: 'default', disabled: false };
    };

    const joinButtonState = getJoinButtonState();


    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold">Club Profile</h1>
                </div>
            </header>
            <main className="flex-grow container mx-auto max-w-2xl p-4 pt-0 pb-4 space-y-6">
                <Card className="rounded-2xl p-4">
                    <div className="flex flex-col items-center text-center gap-3">
                         <BadgePreview 
                            icon={club.badge.icon}
                            iconContent={club.badge.iconContent}
                            bgColor={club.badge.bgColor}
                            borderColor={club.badge.borderColor}
                            size={80}
                        />
                        <h2 className="text-2xl font-bold">{club.name}</h2>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> Club Trophies: {club.trophies.toLocaleString()}</span>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Members: {clubMembers.length}/{club.maxMembers}</span>
                        </div>
                    </div>
                </Card>
                <Card className="rounded-2xl p-4">
                    <CardDescription>{club.description}</CardDescription>
                </Card>

                 <Card className="rounded-2xl">
                    <CardContent className="p-4 grid grid-cols-2 gap-4">
                        {stats.map(stat => (
                            <div key={stat.label} className="flex items-center gap-3">
                                <div className="text-muted-foreground">{stat.icon}</div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    <p className="text-sm font-semibold">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1 h-12 text-base font-semibold">Competition History</Button>
                    <Button variant="secondary" className="flex-1 h-12 text-base font-semibold" disabled={!isOwner}>Challenge</Button>
                    <Button 
                        className="flex-1 h-12 text-base font-semibold" 
                        onClick={handleJoinLeaveClick}
                        variant={joinButtonState.variant as "default" | "destructive" | "secondary"}
                        disabled={joinButtonState.disabled}
                    >
                        {joinButtonState.disabled && <Lock className="w-4 h-4 mr-2" />}
                        {joinButtonState.text}
                    </Button>
                </div>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Members ({clubMembers.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {clubMembers.sort((a,b) => b.trophies - a.trophies).map((member, index) => (
                            <MemberListItem 
                                key={member.id} 
                                member={member} 
                                rank={index + 1}
                                isOwner={isOwner}
                                onRemove={handleRemoveMember}
                                isSelf={member.name === username}
                            />
                        ))}
                    </CardContent>
                </Card>

            </main>
        </div>
    )
}
