
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="sticky top-0 z-10 p-3 flex items-center gap-2 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">{t('about_page.title')}</h1>
      </header>

      <main className="flex-grow container mx-auto max-w-2xl px-4 pb-4">
        <Card className="rounded-2xl mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Info className="w-6 h-6 text-primary" />
              {t('about_page.app_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
             <p className="text-lg font-semibold text-muted-foreground">
              {t('about_page.version')} 3.3.74
            </p>
            <p className="text-sm">
              {t('about_page.subtitle')}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
