
"use client";

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIChat from '@/components/tradeview/ai-chat';
import { useTranslation } from '@/context/LanguageContext';

function AIPageContent() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold">{t('ai_page.title')}</h1>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col min-h-0">
        <AIChat />
      </main>
      
    </div>
  );
}


export default function AIPage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div>{t('loading')}</div>}>
            <AIPageContent />
        </Suspense>
    )
}
