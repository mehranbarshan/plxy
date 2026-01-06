

"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { PlusCircle, Filter, Users, User, Loader2, Star, Send, Trash2, ArrowLeft, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import type { IChannel } from '@/app/models/Channel';
import MarketInsightsSheet from "@/components/tradeview/market-insights-sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import ChannelListItem from "@/components/tradeview/channel-list-item";

const WATCHLIST_KEY = 'tradeview_watchlist_channels';


export default function SearchPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [allPublicChannels, setAllPublicChannels] = useState<(Partial<IChannel> & { _id: any })[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Partial<IChannel> | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchChannels = async () => {
        try {
            const response = await fetch('/api/channels');
            if (response.ok) {
                const data = await response.json();
                setAllPublicChannels(data);
            }
        } catch (error) {
             console.error("Failed to fetch channels for search page", error);
        }
    };
    
    fetchChannels();
    
    const storedWatchlist: string[] = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
    setWatchlistIds(storedWatchlist);
  }, []);
  
  const initialFilters = {
    winRate: [] as string[],
    risk: [] as string[],
    type: [] as string[],
  };

  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const handleWinRateChange = (range: string, checked: boolean) => {
    setTempFilters(prev => ({ ...prev, winRate: checked ? [...prev.winRate, range] : prev.winRate.filter(r => r !== range) }));
  };
  
  const handleTypeChange = (level: string, checked: boolean) => {
    setTempFilters(prev => ({ ...prev, type: checked ? [...prev.type, level] : prev.type.filter(l => l !== level) }));
  };

  const handleRiskChange = (riskValue: string, checked: boolean) => {
    setTempFilters(prev => ({ ...prev, risk: checked ? [...prev.risk, riskValue] : prev.risk.filter(r => r !== riskValue) }));
  };

  const applyFilters = () => {
    setAppliedFilters(tempFilters);
    setIsFilterDialogOpen(false);
  };

  const clearFilters = () => {
    setTempFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const isFilterActive = useMemo(() => {
    return appliedFilters.winRate.length > 0 || appliedFilters.risk.length > 0 || appliedFilters.type.length > 0;
  }, [appliedFilters]);

  const filteredChannels = useMemo(() => {
    if (searchQuery.trim() === '' && !isFilterActive) {
      return [];
    }

    return allPublicChannels.filter(channel => {
      const searchMatch = channel.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!isFilterActive) return searchMatch;

      const fullChannel = channel as IChannel;
      const winRateRanges: { [key: string]: [number, number] } = { "<60": [0, 59.99], "60-70": [60, 70], "70-80": [70, 80], "80-90": [80, 90], "90-100": [90, 100] };
      
      const winRateMatch = appliedFilters.winRate.length === 0 || appliedFilters.winRate.some(range => {
        if (typeof fullChannel.winRate !== 'number') return false;
        const [min, max] = winRateRanges[range];
        return fullChannel.winRate >= min && fullChannel.winRate <= max;
      });

      const riskMatch = appliedFilters.risk.length === 0 || (!!fullChannel.risk && appliedFilters.risk.includes(fullChannel.risk));

      const typeMatch = appliedFilters.type.length === 0 || appliedFilters.type.some(type => {
        if(type === 'Free') return true; // Assuming all listed are free for now
        if(type === 'Paid') return false;
        return true;
      });
      return searchMatch && winRateMatch && riskMatch && typeMatch;
    });
  }, [searchQuery, appliedFilters, allPublicChannels, isFilterActive]);

  const handleAddToWatchlist = (channelId: string) => {
    let updatedWatchlist = [...watchlistIds];
    if (updatedWatchlist.includes(channelId)) {
        updatedWatchlist = updatedWatchlist.filter(id => id !== channelId);
        toast({ title: 'Removed from Watchlist' });
    } else {
        updatedWatchlist.push(channelId);
        toast({ title: 'Added to Watchlist' });
    }
    setWatchlistIds(updatedWatchlist);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedWatchlist));
  };

  const handleAnalyze = (channel: Partial<IChannel>) => {
    setSelectedChannel(channel);
    setIsSheetOpen(true);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background font-body">
        <header className="sticky top-0 z-10 p-4 flex items-center gap-2 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 shrink-0">
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="relative flex-grow">
              <Input
                placeholder={t('search_page.placeholder')}
                className="pr-10 bg-secondary border-none h-12 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 absolute right-1 top-1/2 -translate-y-1/2">
                    <Filter className={cn("h-5 w-5", isFilterActive && "text-primary")} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-lg w-[calc(100%-2rem)] max-w-xl p-0">
                  <DialogHeader className={cn("p-6 pb-0", language === 'fa' && 'rtl-text')}>
                    <div className="flex items-center justify-between">
                      <DialogTitle>{t('search_page.filters_title')}</DialogTitle>
                    </div>
                  </DialogHeader>
                  <div className="grid grid-cols-3 px-4 py-2 gap-2">
                    <div className="flex flex-col space-y-1 p-3 flex-1">
                      <Separator />
                      <Label className={cn("font-semibold text-xs mb-1 px-1 py-2", language === 'fa' && 'rtl-text')}>{t('search_page.accuracy')}</Label>
                      <Separator />
                      <div className="flex flex-col space-y-1 pt-2">
                          <div className="flex items-center space-x-2"><Checkbox id="wr-90-100" checked={tempFilters.winRate.includes('90-100')} onCheckedChange={(c) => handleWinRateChange('90-100', !!c)} /><Label htmlFor="wr-90-100" className="text-xs font-normal">90-100%</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="wr-80-90" checked={tempFilters.winRate.includes('80-90')} onCheckedChange={(c) => handleWinRateChange('80-90', !!c)} /><Label htmlFor="wr-80-90" className="text-xs font-normal">80-90%</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="wr-70-80" checked={tempFilters.winRate.includes('70-80')} onCheckedChange={(c) => handleWinRateChange('70-80', !!c)} /><Label htmlFor="wr-70-80" className="text-xs font-normal">70-80%</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="wr-60-70" checked={tempFilters.winRate.includes('60-70')} onCheckedChange={(c) => handleWinRateChange('60-70', !!c)} /><Label htmlFor="wr-60-70" className="text-xs font-normal">60-70%</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="wr-under-60" checked={tempFilters.winRate.includes('<60')} onCheckedChange={(c) => handleWinRateChange('<60', !!c)} /><Label htmlFor="wr-under-60" className="text-xs font-normal">{'<60%'}</Label></div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 p-3 flex-1">
                      <Separator />
                      <Label className={cn("font-semibold text-xs mb-1 px-1 py-2", language === 'fa' && 'rtl-text')}>{t('search_page.risk_level')}</Label>
                      <Separator />
                      <div className="flex flex-col space-y-1 pt-2">
                          <div className="flex items-center space-x-2"><Checkbox id="risk-low" checked={tempFilters.risk.includes('Low')} onCheckedChange={(c) => handleRiskChange('Low', !!c)} /><Label htmlFor="risk-low" className="text-xs font-normal">Low</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="risk-medium" checked={tempFilters.risk.includes('Medium')} onCheckedChange={(c) => handleRiskChange('Medium', !!c)} /><Label htmlFor="risk-medium" className="text-xs font-normal">Medium</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="risk-high" checked={tempFilters.risk.includes('High')} onCheckedChange={(c) => handleRiskChange('High', !!c)} /><Label htmlFor="risk-high" className="text-xs font-normal">High</Label></div>
                      </div>
                    </div>
                     <div className="flex flex-col space-y-1 p-3 flex-1">
                      <Separator />
                      <Label className={cn("font-semibold text-xs mb-1 px-1 py-2", language === 'fa' && 'rtl-text')}>{t('search_page.type')}</Label>
                      <Separator />
                      <div className="flex flex-col space-y-1 pt-2">
                          <div className="flex items-center space-x-2"><Checkbox id="type-free" checked={tempFilters.type.includes('Free')} onCheckedChange={(c) => handleTypeChange('Free', !!c)} /><Label htmlFor="type-free" className="text-xs font-normal">Free</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="type-paid" checked={tempFilters.type.includes('Paid')} onCheckedChange={(c) => handleTypeChange('Paid', !!c)} /><Label htmlFor="type-paid" className="text-xs font-normal">Paid</Label></div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="p-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={clearFilters}>{t('search_page.clear_button')}</Button>
                    <Button onClick={applyFilters}>{t('search_page.apply_button')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
        </header>

        <main className="flex-grow container mx-auto max-w-2xl px-4 pb-4 pt-2 flex flex-col relative z-10">
          <div className="pt-4 space-y-4">
            {filteredChannels.length > 0 ? (
                filteredChannels.map((channel) => <ChannelListItem key={channel._id} channel={channel} />)
            ) : (
                <Card className={cn("p-6 text-center text-muted-foreground border-none shadow-none bg-transparent", language === 'fa' && 'rtl-text')}>
                    {searchQuery.trim() === '' && !isFilterActive ? (
                        <div className="flex flex-col items-center justify-center pt-16">
                            <Image src="/images/search.png" alt="Search" width={128} height={128} className="mb-4" />
                            <p>{t('search_page.no_results_initial')}</p>
                        </div>
                    ) : (
                        t('search_page.no_results_filtered')
                    )}
                </Card>
            )}
          </div>
        </main>
      </div>
      <MarketInsightsSheet 
          channel={selectedChannel}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
      />
    </>
  );
}
