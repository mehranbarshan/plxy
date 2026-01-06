
"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarsList from '@/components/tradeview/avatars-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/context/LanguageContext';

const PURCHASED_AVATARS_KEY = 'tradeview_purchased_avatars';

function AvatarsPageContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasedAvatars, setPurchasedAvatars] = useState<string[]>([]);
  const [showTabs, setShowTabs] = useState(false);

  useEffect(() => {
    const checkPurchases = () => {
      const storedPurchases = localStorage.getItem(PURCHASED_AVATARS_KEY);
      if (storedPurchases) {
        const parsed = JSON.parse(storedPurchases);
        setPurchasedAvatars(parsed);
        if (parsed.length > 0) {
          setShowTabs(true);
        }
      }
    };
    checkPurchases();

    window.addEventListener('storage', checkPurchases);
    return () => window.removeEventListener('storage', checkPurchases);
  }, []);
  
  const handlePurchaseSuccess = () => {
      const storedPurchases = localStorage.getItem(PURCHASED_AVATARS_KEY);
      if (storedPurchases) {
        const parsed = JSON.parse(storedPurchases);
        setPurchasedAvatars(parsed);
        setShowTabs(true);
      }
  }


  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Tabs defaultValue="shop" className="flex flex-col flex-grow">
        <header className="sticky top-0 z-20 bg-background border-b pt-4 pb-2">
          <div className="container mx-auto max-w-2xl px-2">
            <div className="flex items-center justify-between gap-2 px-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-bold">{t('avatars_page.title')}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 font-semibold">
                      <Image src="/Money.png" alt="Money" width={20} height={20} />
                      <span>$19.69K</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5 font-semibold">
                      <Image src="/Plxy-coin.png" alt="Plxy Coin" width={20} height={20} />
                      <span>165</span>
                  </div>
              </div>
            </div>
             {showTabs && (
               <TabsList className="bg-transparent p-0 h-auto w-full flex justify-center mt-2">
                    <TabsTrigger value="shop" className="header-tabs-trigger">{t('avatars_page.shop')}</TabsTrigger>
                    <TabsTrigger value="purchased" className="header-tabs-trigger">{t('avatars_page.purchased')}</TabsTrigger>
                </TabsList>
             )}
          </div>
        </header>

        <main className="flex-grow overflow-y-auto container mx-auto max-w-2xl p-4">
          {showTabs ? (
            <>
              <TabsContent value="shop" className="mt-0">
                  <AvatarsList
                      searchQuery={searchQuery}
                      onPurchaseSuccess={handlePurchaseSuccess}
                      purchasedAvatars={purchasedAvatars}
                  />
              </TabsContent>
              <TabsContent value="purchased" className="mt-0">
                  <AvatarsList
                      searchQuery={searchQuery}
                      onPurchaseSuccess={handlePurchaseSuccess}
                      purchasedAvatars={purchasedAvatars}
                      showOnlyPurchased={true}
                  />
              </TabsContent>
            </>
          ) : (
             <div className="space-y-4">
                 <AvatarsList
                    searchQuery={searchQuery}
                    onPurchaseSuccess={handlePurchaseSuccess}
                    purchasedAvatars={purchasedAvatars}
                />
             </div>
          )}
        </main>
      </Tabs>
    </div>
  );
}


export default function AvatarsPage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div>{t('loading')}</div>}>
            <AvatarsPageContent />
        </Suspense>
    )
}
