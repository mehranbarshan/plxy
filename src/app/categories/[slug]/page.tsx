
"use client";

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from '@/context/LanguageContext';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function CategoryDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { t, language } = useTranslation();
    
    // Get the raw slug
    const rawSlug = params.slug as string;

    // Clean up any potential extra quotes and decode URI component
    const cleanSlug = decodeURIComponent(rawSlug).replace(/['"]+/g, '');
    
    const title = cleanSlug
        .replace(/-/g, ' ')
        .replace(/ and /g, ' & ')
        .replace(/\b\w/g, char => char.toUpperCase());

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
             <Tabs defaultValue="all" className="flex-grow flex flex-col">
                <header className={cn("sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-blue-500 text-white", language === 'fa' && 'flex-row-reverse')}>
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
                        <ArrowLeft className={cn("w-5 h-5", language === 'fa' && "rotate-180")} />
                    </Button>
                    <h1 className="text-lg font-bold">{title}</h1>
                </header>
                 <div className="container mx-auto max-w-2xl px-4">
                    <Separator />
                    <TabsList className="bg-transparent p-0 h-auto">
                        <TabsTrigger value="all" className="category-detail-tabs-trigger">{t('category_detail_page.all')}</TabsTrigger>
                        <TabsTrigger value="channels" className="category-detail-tabs-trigger">{t('category_detail_page.channels')}</TabsTrigger>
                        <TabsTrigger value="groups" className="category-detail-tabs-trigger">{t('category_detail_page.groups')}</TabsTrigger>
                        <TabsTrigger value="bots" className="category-detail-tabs-trigger">{t('category_detail_page.bots')}</TabsTrigger>
                    </TabsList>
                    <Separator />
                 </div>
                <main className="flex-grow container mx-auto max-w-2xl px-4 pb-4 pt-2 space-y-2">
                    <TabsContent value="all" className="mt-4">
                        <Card className="rounded-2xl">
                            <CardContent className="p-6 text-center text-muted-foreground">
                                {t('category_detail_page.content_placeholder', { title: title, tab: t('category_detail_page.all') })}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="channels" className="mt-4">
                        <Card className="rounded-2xl">
                            <CardContent className="p-6 text-center text-muted-foreground">
                                {t('category_detail_page.content_placeholder', { title: title, tab: t('category_detail_page.channels') })}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="groups" className="mt-4">
                        <Card className="rounded-2xl">
                            <CardContent className="p-6 text-center text-muted-foreground">
                                {t('category_detail_page.content_placeholder', { title: title, tab: t('category_detail_page.groups') })}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="bots" className="mt-4">
                        <Card className="rounded-2xl">
                            <CardContent className="p-6 text-center text-muted-foreground">
                                {t('category_detail_page.content_placeholder', { title: title, tab: t('category_detail_page.bots') })}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </main>
            </Tabs>
        </div>
    )
}
