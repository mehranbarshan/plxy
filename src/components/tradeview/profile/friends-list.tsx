
"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronRight, Users } from 'lucide-react';

const friends = [
  { name: 'Alice Chen', winRate: '78%', streak: '8 day', status: 'online', avatar: '' },
  { name: 'Bob Wilson', winRate: '65%', streak: '15 day', status: 'offline', avatar: 'https://placehold.co/40x40.png', dataAiHint: 'man portrait' },
  { name: 'Carol Davis', winRate: '82%', streak: '3 day', status: 'online', avatar: 'https://placehold.co/40x40.png', dataAiHint: 'woman portrait' }
];

function FriendListItem({ friend }: { friend: typeof friends[0] }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={friend.avatar} alt={friend.name} data-ai-hint={friend.dataAiHint} />
            <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
           <div className={cn(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
              friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
           )} />
        </div>
        <div>
          <p className="font-semibold text-sm">{friend.name}</p>
          <p className="text-xs text-muted-foreground">{friend.winRate} win rate • {friend.streak} streak</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </div>
  )
}

export default function FriendsList() {
  return (
    <Card className="rounded-2xl p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-base">Friends ({friends.length})</h2>
        </div>
        <Button variant="outline" size="sm">Add Friends</Button>
      </div>
      <div className="space-y-1">
        {friends.map(friend => <FriendListItem key={friend.name} friend={friend} />)}
      </div>
    </Card>
  )
}
