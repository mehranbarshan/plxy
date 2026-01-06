
"use client"

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, Gem, Gift } from 'lucide-react';

export default function InvitationCodeCard() {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText("JOHN2024");
    toast({
      title: "Copied to clipboard!",
      description: "Your invitation code is ready to be shared.",
    });
  };

  return (
    <Card className="rounded-2xl p-4 mt-6">
      <div className="flex items-center gap-3 mb-2">
        <Gift className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-semibold text-base">Invitation Code</h2>
      </div>
      <p className="text-muted-foreground text-sm mb-4">
        Share your code and earn diamonds when friends join
      </p>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-grow bg-secondary/50 dark:bg-secondary/30 rounded-lg px-4 py-2 font-mono text-center text-sm">
          JOHN2024
        </div>
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          <Copy className="w-5 h-5" />
        </Button>
      </div>
      <div className="bg-blue-100/60 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 rounded-lg p-3 text-center text-xs">
        Earn <span className="font-bold">500</span> <Gem className="inline-block w-3.5 h-3.5 text-blue-500 -mt-1 mx-0.5" /> for each friend who joins and completes first trade
      </div>
    </Card>
  )
}
