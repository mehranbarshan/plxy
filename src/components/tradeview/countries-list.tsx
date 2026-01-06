
'use client';

import React, { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

interface Country {
    name: {
        common: string;
        official: string;
    };
    cca2: string; // Country code
    flags: {
        png: string;
        svg: string;
        alt: string;
    };
    population: number;
}

const SELECTED_FLAG_KEY = 'tradeview_selected_flag_url';
const PURCHASED_FLAGS_KEY = 'tradeview_purchased_flags';

const CountryGridItem = ({ country, onPurchase, isPurchasedView, isSelected, onApply }: { country: Country; onPurchase: (country: Country) => void; isPurchasedView: boolean; isSelected: boolean; onApply: (flagUrl: string) => void; }) => {
  const purchasePrice = 20000;
  const [purchaseState, setPurchaseState] = useState<'purchase' | 'applying' | 'continue'>('purchase');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handlePurchaseClick = () => {
    onPurchase(country);
    setPurchaseState('applying');
    setTimeout(() => {
      setPurchaseState('continue');
    }, 1500);
  };
  
  const getButtonContent = () => {
    switch (purchaseState) {
      case 'applying':
        return 'Applying...';
      case 'continue':
        return 'Continue';
      default:
        return 'Purchased';
    }
  };

  const handleApplyClick = () => {
    onApply(country.flags.svg);
    toast({
        title: "Flag Applied!",
        description: "Your new flag is now active on your profile."
    });
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (purchaseState === 'purchase') {
      handlePurchaseClick();
    } else if (purchaseState === 'continue') {
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isPurchasedView) {
      handleApplyClick();
      return;
    }
    setIsOpen(open);
    if (!open) {
      setTimeout(() => setPurchaseState('purchase'), 300);
    }
  };
  
  const getDisplayText = () => {
      if (isPurchasedView) {
          if (isSelected) {
              return "Applied";
          }
          return "Apply";
      }
      return `$${purchasePrice.toLocaleString()}`;
  }

  const cardContent = (
     <Card className={cn("relative rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-secondary transition-colors aspect-square", isSelected && isPurchasedView ? 'border-green-500' : '')}>
        <div className="w-16 h-16 relative">
          <Image src={country.flags.svg} alt={country.name.common} layout="fill" objectFit="cover" className="rounded-full border-2 border-border" />
        </div>
        <div className={cn("text-sm font-semibold", isSelected && isPurchasedView ? "text-green-500" : "text-muted-foreground", !isPurchasedView && "bg-green-100/60 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md")}>{getDisplayText()}</div>
      </Card>
  )

  if(isPurchasedView) {
    return <div onClick={handleApplyClick}>{cardContent}</div>
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {cardContent}
      </DialogTrigger>
      <DialogContent className="max-w-[300px] rounded-2xl">
        <DialogHeader>
          <div className="w-24 h-24 relative mx-auto mb-4">
             <Image src={country.flags.svg} alt={country.name.common} layout="fill" objectFit="cover" className="rounded-full border-4 border-border" />
          </div>
          <DialogTitle className="text-center">{country.name.common}</DialogTitle>
           
        </DialogHeader>
        <div className="py-2 text-center">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-2xl font-bold">${purchasePrice.toLocaleString()}</p>
        </div>
        <DialogFooter className="grid gap-2">
            <Button onClick={handleButtonClick} className="w-full h-11 text-base" disabled={purchaseState === 'applying'}>
              {getButtonContent()}
            </Button>
            {purchaseState === 'continue' && (
                <Button onClick={handleApplyClick} variant="outline" className="w-full h-11 text-base">
                    Apply
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const LoadingSkeleton = () => (
    <div className="grid grid-cols-3 gap-2">
        {[...Array(15)].map((_, i) => (
             <Card key={i} className="p-3 rounded-xl flex flex-col items-center gap-2 aspect-square">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-5 w-20" />
             </Card>
        ))}
    </div>
)

export interface CountriesListHandles {
    handleIndexClick: (letter: string) => void;
}

interface CountriesListProps {
    searchQuery: string;
    onSearchChange?: (query: string) => void;
    onPurchaseSuccess: () => void;
    purchasedFlags: string[];
    showOnlyPurchased?: boolean;
}

const CountriesList = forwardRef<CountriesListHandles, CountriesListProps>(({
  searchQuery,
  onSearchChange,
  onPurchaseSuccess,
  purchasedFlags,
  showOnlyPurchased = false,
}, ref) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const { toast } = useToast();
  const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useImperativeHandle(ref, () => ({
    handleIndexClick(letter: string) {
        letterRefs.current[letter]?.scrollIntoView({ behavior: 'smooth' });
    }
  }));
  

  useEffect(() => {
    const storedFlag = localStorage.getItem(SELECTED_FLAG_KEY);
    if(storedFlag) {
        setSelectedFlag(storedFlag);
    }
    
    async function fetchCountries() {
      try {
        setLoading(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags,population');
        if (!response.ok) {
            throw new Error('Failed to fetch country data');
        }
        let data: Country[] = await response.json();
        
        data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchCountries();
  }, []);
  
  const handleApplyFlag = (flagUrl: string) => {
    localStorage.setItem(SELECTED_FLAG_KEY, flagUrl);
    setSelectedFlag(flagUrl);
    window.dispatchEvent(new Event('storage'));
  }

  const handlePurchase = (country: Country) => {
    const currentPurchased = JSON.parse(localStorage.getItem(PURCHASED_FLAGS_KEY) || '[]');
    if (!currentPurchased.includes(country.cca2)) {
        const newPurchased = [...currentPurchased, country.cca2];
        localStorage.setItem(PURCHASED_FLAGS_KEY, JSON.stringify(newPurchased));
        toast({
            title: "Flag Purchased!",
            description: `${country.name.common} flag has been added to your collection.`,
        });
        onPurchaseSuccess();
    } else {
         toast({
            title: "Already Owned",
            description: `You already own the ${country.name.common} flag.`,
        });
    }
  };

  const filteredCountries = useMemo(() => {
    let sourceCountries = countries;
    if (showOnlyPurchased) {
        sourceCountries = countries.filter(c => purchasedFlags.includes(c.cca2));
    }
      
    return sourceCountries.filter(country => {
        const query = searchQuery.toLowerCase();
        const commonNameMatch = country.name.common.toLowerCase().includes(query);
        const officialNameMatch = country.name.official.toLowerCase().includes(query);
        return commonNameMatch || officialNameMatch;
    });
  }, [countries, searchQuery, showOnlyPurchased, purchasedFlags]);
  
  const groupedCountries = useMemo(() => {
    return filteredCountries.reduce((acc, country) => {
        const firstLetter = country.name.common.charAt(0).toUpperCase();
        if (!/^[A-Z]$/.test(firstLetter)) {
            return acc;
        }
        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }
        acc[firstLetter].push(country);
        return acc;
    }, {} as Record<string, Country[]>);
  }, [filteredCountries]);

  return (
    <div className="relative">
      <Card className="bg-transparent shadow-none border-none">
        <CardContent className="p-0">
          {loading && <LoadingSkeleton />}
          {error && <p className="text-destructive text-center">{error}</p>}
          {!loading && !error && filteredCountries.length === 0 && (
              <p className="text-muted-foreground text-center p-4">
                {showOnlyPurchased ? "You haven't purchased any flags yet." : "No results found."}
              </p>
          )}
          {Object.keys(groupedCountries).length > 0 && (
            <div className="space-y-4">
                {Object.keys(groupedCountries).sort().map(letter => (
                    <div key={letter} ref={el => { letterRefs.current[letter] = el; }}>
                        <h2 className="sticky top-[-20px] z-10 p-2 text-base font-bold text-primary bg-background shadow-md rounded-lg">{letter}</h2>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {groupedCountries[letter].map(country => (
                                <CountryGridItem
                                    key={country.cca2}
                                    country={country}
                                    onPurchase={handlePurchase}
                                    isPurchasedView={showOnlyPurchased}
                                    isSelected={selectedFlag === country.flags.svg}
                                    onApply={handleApplyFlag}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

CountriesList.displayName = 'CountriesList';
export default CountriesList;
