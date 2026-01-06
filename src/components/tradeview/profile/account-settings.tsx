

"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Lock } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { differenceInDays, addDays, formatDistanceToNow } from 'date-fns';
import type { Member } from '@/lib/member-data';
import type { CommunitySignal } from '@/components/tradeview/community-signals-tab';
import type { ChatMessage } from '@/lib/club-data';

const USERNAME_KEY = 'tradeview_username';
const USERNAME_LAST_CHANGED_KEY = 'tradeview_username_last_changed';
const CHANGE_INTERVAL_DAYS = 30;
const MEMBERS_KEY = 'tradeview_members';
const COMMUNITY_SIGNALS_KEY = 'tradeview_community_signals';
const CHAT_STORAGE_PREFIX = 'tradeview_club_chat_';


export default function AccountSettings() {
  const { toast } = useToast();
  const router = useRouter();
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('user@example.com');
  const [canChangeUsername, setCanChangeUsername] = useState(false);
  const [daysUntilNextChange, setDaysUntilNextChange] = useState(0);

  useEffect(() => {
    const storedUsername = localStorage.getItem(USERNAME_KEY);
    if (storedUsername) {
      setUsername(storedUsername);
      setEmail(`${storedUsername.toLowerCase().replace(/ /g, '.')}@example.com`);
    }

    const lastChangedDateStr = localStorage.getItem(USERNAME_LAST_CHANGED_KEY);
    if (lastChangedDateStr) {
      const lastChangedDate = new Date(lastChangedDateStr);
      const daysSinceLastChange = differenceInDays(new Date(), lastChangedDate);
      
      if (daysSinceLastChange < CHANGE_INTERVAL_DAYS) {
        setCanChangeUsername(false);
        setDaysUntilNextChange(CHANGE_INTERVAL_DAYS - daysSinceLastChange);
      } else {
        setCanChangeUsername(true);
      }
    } else {
      // If it's never been changed, they can change it.
      setCanChangeUsername(true);
    }
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }

  const handleUpdate = () => {
     if (!canChangeUsername) {
        toast({
            variant: 'destructive',
            title: 'Username Change Not Allowed',
            description: `You can change your username again in ${daysUntilNextChange} day(s).`,
        });
        return;
     }

     if (username.trim().length < 3) {
      toast({
        variant: 'destructive',
        title: 'Invalid Username',
        description: 'Username must be at least 3 characters long.',
      });
      return;
    }

    const oldUsername = localStorage.getItem(USERNAME_KEY) || 'John Doe';
    const newUsername = username.trim();

    if (oldUsername === newUsername) {
      toast({ title: "No Changes", description: "Your username is already set to this."});
      return;
    }

    // 1. Update main username
    localStorage.setItem(USERNAME_KEY, newUsername);
    localStorage.setItem(USERNAME_LAST_CHANGED_KEY, new Date().toISOString());

    // 2. Update members list
    const membersRaw = localStorage.getItem(MEMBERS_KEY);
    if (membersRaw) {
        let members: Member[] = JSON.parse(membersRaw);
        members = members.map(member => member.name === oldUsername ? { ...member, name: newUsername } : member);
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    }

    // 3. Update community signals
    const signalsRaw = localStorage.getItem(COMMUNITY_SIGNALS_KEY);
    if (signalsRaw) {
        let signals: CommunitySignal[] = JSON.parse(signalsRaw);
        signals = signals.map(signal => signal.traderName === oldUsername ? { ...signal, traderName: newUsername } : signal);
        localStorage.setItem(COMMUNITY_SIGNALS_KEY, JSON.stringify(signals));
    }

    // 4. Update all club chats
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CHAT_STORAGE_PREFIX)) {
            const chatRaw = localStorage.getItem(key);
            if (chatRaw) {
                let chatMessages: ChatMessage[] = JSON.parse(chatRaw);
                chatMessages = chatMessages.map(msg => msg.user === oldUsername ? { ...msg, user: newUsername } : msg);
                localStorage.setItem(key, JSON.stringify(chatMessages));
            }
        }
    }
    
    toast({
      title: "Profile Updated Successfully!",
      description: "Your username has been updated across the app.",
    });

    // Reload the page to reflect changes everywhere
    window.location.reload(); 
  };

  const handleLogout = async () => {
     toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    localStorage.removeItem(USERNAME_KEY);
    router.push('/login');
  }

  return (
    <Card className="rounded-2xl mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="w-5 h-5 text-muted-foreground" />
          Account Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">Email</Label>
          <Input id="email" type="email" value={email} disabled />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="username" className="text-sm">Username</Label>
             {!canChangeUsername && (
                <p className="text-xs text-muted-foreground">
                    Next change available in {daysUntilNextChange} day(s)
                </p>
            )}
          </div>
           <div className="relative">
             <Input id="username" type="text" value={username} onChange={handleUsernameChange} disabled={!canChangeUsername} />
             {!canChangeUsername && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
             )}
           </div>
        </div>
        <Button className="w-full" onClick={handleUpdate} disabled={!canChangeUsername}>Update Profile</Button>
        <Separator />
        
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
        </Button>
        
      </CardContent>
    </Card>
  );
}
