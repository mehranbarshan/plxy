
"use client"

import { Card } from '@/components/ui/card';
import { User, Users } from 'lucide-react';

export default function FollowerStats() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <Card className="rounded-2xl p-4 flex flex-col items-center text-center gap-1 shadow-sm">
        <Users className="w-6 h-6 text-primary" />
        <p className="text-lg font-bold">234</p>
        <p className="text-xs text-muted-foreground">Followers</p>
      </Card>
      <Card className="rounded-2xl p-4 flex flex-col items-center text-center gap-1 shadow-sm">
        <User className="w-6 h-6 text-primary" />
        <p className="text-lg font-bold">89</p>
        <p className="text-xs text-muted-foreground">Following</p>
      </Card>
    </div>
  );
}
