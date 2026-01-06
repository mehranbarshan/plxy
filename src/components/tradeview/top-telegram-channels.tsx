
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, TrendingUp } from "lucide-react";

const mockChannels = [
    { id: 1, name: "Crypto Pump Station", avatar: "https://placehold.co/100x100/7c3aed/white?text=PS", subscribers: "125K", winRate: 88.2 },
    { id: 2, name: "Whale Blockchain Alerts", avatar: "https://placehold.co/100x100/1d4ed8/white?text=WA", subscribers: "512K", winRate: 85.1 },
    { id: 3, name: "DeFi Signal Masters", avatar: "https://placehold.co/100x100/c2410c/white?text=DM", subscribers: "78K", winRate: 82.5 },
];

export default function TopTelegramChannels() {
  return (
    <Card className="bg-transparent shadow-none border-none">
      <CardHeader className="p-0">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Top Channels</h2>
          <Link href="/telegram-channels">
            <Button variant="link" className="text-primary">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-2">
        {mockChannels.map((channel) => (
          <div key={channel.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={channel.avatar} />
                <AvatarFallback>{channel.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold truncate text-sm">{channel.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {channel.subscribers}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 text-green-500 font-semibold text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>{channel.winRate}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
