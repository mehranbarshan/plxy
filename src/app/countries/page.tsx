
"use client";

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CountriesList, { type CountriesListHandles } from '@/components/tradeview/countries-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

const PURCHASED_FLAGS_KEY = 'tradeview_purchased_flags';

function CountriesPageContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasedFlags, setPurchasedFlags] = useState<string[]>([]);
  const [showTabs, setShowTabs] = useState(false);
  const countriesListRef = useRef<CountriesListHandles>(null);

  useEffect(() => {
    const checkPurchases = () => {
      const storedPurchases = localStorage.getItem(PURCHASED_FLAGS_KEY);
      if (storedPurchases) {
        const parsed = JSON.parse(storedPurchases);
        setPurchasedFlags(parsed);
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
      const storedPurchases = localStorage.getItem(PURCHASED_FLAGS_KEY);
      if (storedPurchases) {
        const parsed = JSON.parse(storedPurchases);
        setPurchasedFlags(parsed);
        setShowTabs(true);
      }
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  const handleAlphabetClick = (letter: string) => {
    countriesListRef.current?.handleIndexClick(letter);
  };


  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Tabs defaultValue="shop" className="flex flex-col flex-grow min-h-0">
        <header className="sticky top-0 z-20 bg-background border-b pt-4 pb-2">
          <div className="container mx-auto max-w-2xl px-2">
            <div className="flex items-center justify-between gap-2 px-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-bold">Flags</h1>
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
                    <TabsTrigger value="shop" className="header-tabs-trigger">Shop</TabsTrigger>
                    <TabsTrigger value="purchased" className="header-tabs-trigger">Purchased</TabsTrigger>
                </TabsList>
             )}
           </div>
        </header>

        <main className="flex-grow overflow-y-auto container mx-auto max-w-2xl p-4 flex gap-2">
          <div className="flex-grow">
            <TabsContent value="shop" className="m-0">
                <CountriesList
                    ref={countriesListRef}
                    searchQuery={searchQuery}
                    onPurchaseSuccess={handlePurchaseSuccess}
                    purchasedFlags={purchasedFlags}
                />
            </TabsContent>
            <TabsContent value="purchased" className="m-0">
                <CountriesList
                    ref={countriesListRef}
                    searchQuery={searchQuery}
                    onPurchaseSuccess={handlePurchaseSuccess}
                    purchasedFlags={purchasedFlags}
                    showOnlyPurchased={true}
                />
            </TabsContent>
          </div>
           <div className="sticky top-12 z-20 flex flex-col items-center bg-background/50 backdrop-blur-sm py-2 rounded-full border border-border/50 h-min">
            {alphabet.map(letter => (
                <button
                    key={letter}
                    onClick={() => handleAlphabetClick(letter)}
                    className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors p-0.5 w-5 h-4 flex items-center justify-center"
                >
                    {letter}
                </button>
            ))}
          </div>
        </main>
      </Tabs>
    </div>
  );
}


export default function CountriesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CountriesPageContent />
        </Suspense>
    )
}
