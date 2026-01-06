

"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Trophy, Send, MessageSquare, LogOut, Pencil } from 'lucide-react';
import type { Club, ChatMessage } from '@/lib/club-data';
import { members as initialMembersData, type Member } from '@/lib/member-data';
import BadgePreview from './badge-preview';
import { cn } from '@/lib/utils';
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
import Link from 'next/link';


const MEMBERS_KEY = 'tradeview_members';
const USERNAME_KEY = 'tradeview_username';
const CHAT_STORAGE_PREFIX = 'tradeview_club_chat_';
const MAX_CHAT_MESSAGES = 150;

const generateColorFromUsername = (username: string) => {
    if (!username) return 'hsl(240, 4.8%, 95.9%)'; // Default muted color
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 30%)`; // Using 30% lightness for darker, richer colors
};


const MemberItem = ({ member, isOnline }: { member: Member, isOnline: boolean }) => (
    <Link href={`/trader/${member.id}`} className="block rounded-lg hover:bg-secondary">
        <div className="flex items-center gap-3 p-2">
            <div className="relative">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-white" style={{ backgroundColor: generateColorFromUsername(member.name) }}>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card", isOnline ? 'bg-green-500' : 'bg-gray-400')} />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-sm">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-bold">{member.trophies.toLocaleString()}</span>
            </div>
        </div>
    </Link>
);

export default function MyClubView({ club, onLeave }: { club: Club, onLeave: () => void }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeView, setActiveView] = useState<'members' | 'chat'>('members');
    const [clubMembers, setClubMembers] = useState<Member[]>([]);
    const [onlineMembers, setOnlineMembers] = useState<Member[]>([]);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const storedMembers = localStorage.getItem(MEMBERS_KEY);
        const currentMembers: Member[] = storedMembers ? JSON.parse(storedMembers) : initialMembersData;
        const membersOfClub = currentMembers.filter((m: Member) => m.clubId === club.id);
        setClubMembers(membersOfClub);
        
        const username = localStorage.getItem(USERNAME_KEY);
        const currentUserInClub = membersOfClub.find((m: Member) => m.name === username);
        if (currentUserInClub && currentUserInClub.role === 'Owner') {
            setIsOwner(true);
        }

        // Simulate some members being online
        setOnlineMembers(membersOfClub.slice(0, Math.floor(membersOfClub.length / 2) + 1));
        
        const chatStorageKey = `${CHAT_STORAGE_PREFIX}${club.id}`;
        const storedChat = localStorage.getItem(chatStorageKey);
        if (storedChat) {
            setMessages(JSON.parse(storedChat));
        } else {
            setMessages(club.chatMessages || []);
        }

    }, [club.id, club.chatMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const username = localStorage.getItem(USERNAME_KEY) || "User";
        const avatar = localStorage.getItem('tradeview_avatar') || "https://picsum.photos/seed/1/100/100";

        const msg: ChatMessage = {
            user: username,
            avatar: avatar,
            message: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        
        const updatedMessages = [...messages, msg].slice(-MAX_CHAT_MESSAGES);
        setMessages(updatedMessages);
        
        const chatStorageKey = `${CHAT_STORAGE_PREFIX}${club.id}`;
        localStorage.setItem(chatStorageKey, JSON.stringify(updatedMessages));
        
        setNewMessage('');
    };

    return (
        <div className="space-y-4 flex flex-col h-full">
            <Card className="rounded-2xl overflow-hidden">
                <CardHeader className="p-4 bg-secondary/30 flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <BadgePreview 
                        icon={club.badge.icon}
                        iconContent={club.badge.iconContent}
                        bgColor={club.badge.bgColor}
                        borderColor={club.badge.borderColor}
                        size={60}
                        className="flex-shrink-0"
                    />
                    <div className="flex-grow">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <CardTitle className="text-xl font-bold">{club.name}</CardTitle>
                             {isOwner && (
                                <Link href={`/club/${club.id}/edit`}>
                                    <Button variant="ghost" size="icon" className="w-7 h-7">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                        <CardDescription className="text-xs">{club.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Club Trophies</p>
                            <p className="font-bold">{club.trophies.toLocaleString()}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Members</p>
                            <p className="font-bold">{club.members}/{club.maxMembers}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 h-12 text-base font-semibold">Competition History</Button>
                <Button variant="secondary" className="flex-1 h-12 text-base font-semibold" disabled>Challenge</Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" size="icon" className="h-12 w-12 flex-shrink-0">
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Leave {club.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to leave this club? You can rejoin later if it's an open club.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onLeave} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                Yes, Leave
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div className="flex items-center space-x-2 bg-secondary p-1 rounded-lg">
                <Button 
                    variant={activeView === 'members' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveView('members')}
                    className="text-xs h-8 flex-1"
                >
                    Members
                </Button>
                <Button 
                    variant={activeView === 'chat' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveView('chat')}
                    className="text-xs h-8 flex-1"
                >
                    Chat
                </Button>
            </div>

             <div className="flex-grow min-h-0">
                {activeView === 'members' && (
                    <Card className="rounded-2xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>Members</span>
                                <span className="text-xs font-normal text-green-500">{onlineMembers.length} Online</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 overflow-hidden">
                            <ScrollArea className="max-h-72">
                                <div className="space-y-2">
                                    {clubMembers.map(member => (
                                        <MemberItem key={member.id} member={member} isOnline={onlineMembers.some(om => om.id === member.id)} />
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}

                {activeView === 'chat' && (
                    <Card className="rounded-2xl flex flex-col h-full">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                                <span>Club Chat</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col p-0">
                            <ScrollArea className="flex-grow px-4">
                                <div className="space-y-4">
                                    {messages.map((msg, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={msg.avatar} />
                                                <AvatarFallback className="text-white" style={{ backgroundColor: generateColorFromUsername(msg.user) }}>{msg.user.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="font-semibold text-sm">{msg.user}</p>
                                                    <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                                                </div>
                                                <p className="text-sm">{msg.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <form onSubmit={handleSendMessage} className="p-4 border-t mt-auto">
                                <div className="relative">
                                    <Input 
                                        placeholder="Send a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="pr-12"
                                    />
                                    <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
