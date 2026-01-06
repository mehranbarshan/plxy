
"use client"

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Copy,
  Gift,
  Gem
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ACCOUNTid_KEY = 'tradeview_accountid';

export default function InvitePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [invitationCode, setInvitationCode] = useState('');

  useEffect(() => {
    let accountId = localStorage.getItem(ACCOUNTid_KEY);
    if (!accountId) {
        // Generate a simple unique ID if it doesn't exist
        accountId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(ACCOUNTid_KEY, accountId);
    }
    // Take the last 6 chars of the unique ID and make it uppercase.
    const generatedCode = accountId.slice(-6).toUpperCase();
    setInvitationCode(generatedCode);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(invitationCode);
    toast({
      title: "Copied to clipboard!",
      description: "Your invitation code is ready to be shared.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="sticky top-0 z-10 p-3 flex items-center gap-2 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Invite Friends</h1>
      </header>

      <main className="flex-grow container mx-auto max-w-2xl px-4 pb-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-sm rounded-2xl p-4">
          <CardContent className="p-0">
             <div className="flex flex-col items-center text-center">
                 <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Gift className="w-8 h-8 text-primary" />
                 </div>
                <h2 className="font-semibold text-base">Invite Friends & Earn Rewards</h2>
                <div className="w-full flex items-center gap-2 my-6">
                    <div className="flex-grow bg-secondary rounded-lg px-4 py-3 font-mono text-center text-sm">
                    {invitationCode}
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="w-5 h-5" />
                    </Button>
                </div>
                <Button className="w-full h-11" onClick={handleCopy}>Share Code</Button>
                <div className="bg-blue-100/60 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 rounded-lg p-3 text-center text-xs mt-4">
                    Earn a FREE analysis for each friend who joins (max 10 rewards).
                </div>
             </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
