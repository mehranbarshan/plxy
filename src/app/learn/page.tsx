
"use client";

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LearnTabContent from '@/components/tradeview/history/learn-tab-content';

function LearnPageContent() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold">Learn to Trade</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto max-w-2xl p-4 pt-0 pb-4 space-y-4">
        <LearnTabContent />
      </main>
    </div>
  );
}


export default function LearnPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LearnPageContent />
        </Suspense>
    )
}
