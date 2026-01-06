
"use client";

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommunitySignalsTab from '@/components/tradeview/community-signals-tab';

function CommunityPageContent() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold">Community</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto max-w-2xl p-4 pt-0 pb-4 space-y-4">
        <CommunitySignalsTab />
      </main>
    </div>
  );
}

export default function CommunityPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CommunityPageContent />
        </Suspense>
    )
}
