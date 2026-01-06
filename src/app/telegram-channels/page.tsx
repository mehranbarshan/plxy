
"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { PlusCircle, Search, Filter, Users, User, Loader2, Star, Send, Trash2, Plus } from "lucide-react";
import { useMemo, useState, useEffect, useRef, Suspense } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IChannel } from '@/app/models/Channel';
import MarketInsightsSheet from "@/components/tradeview/market-insights-sheet";
import AppHeader from "@/components/tradeview/app-header";
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
import { useTranslation } from "@/context/LanguageContext";
import { useRouter, useSearchParams } from 'next/navigation';
import SettingsSheet from "@/components/tradeview/settings-sheet";
import InstallPwaButton from "@/components/tradeview/install-pwa-button";
import CommunitySignalsTab from "@/components/tradeview/community-signals-tab";
import ChannelListItem from "@/components/tradeview/channel-list-item";
import Image from "next/image";


type ChannelCategory = "All" | "Risk" | "Win Rate" | "Credibility";

const WATCHLIST_KEY = 'tradeview_watchlist_channels';
const TABS_ORDER_KEY = 'tradeview_tabs_order';
const FOLDERS_KEY = 'tradeview_watchlist_folders';


const RatingDialog = ({ channel, open, onOpenChange, onRateSubmit }: { channel: Partial<IChannel> | null, open: boolean, onOpenChange: (open: boolean) => void, onRateSubmit: (rating: number) => void }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rate {channel?.name}</DialogTitle>
                    <DialogDescription>
                        Select a star rating for this channel.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={cn(
                                "w-10 h-10 cursor-pointer",
                                (hoverRating >= star || rating >= star) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            )}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={() => onRateSubmit(rating)}>Submit Rating</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const TABS_DATA = [
    { value: 'all', labelKey: 'telegram_channels.tab_all' },
    { value: 'signals', labelKey: 'telegram_channels.tab_signals' },
    { value: 'news', labelKey: 'telegram_channels.tab_crypto_news' },
    { value: 'airdrop', labelKey: 'telegram_channels.tab_airdrop' },
    { value: 'insight', labelKey: 'telegram_channels.tab_insight' },
];

function TelegramChannelsPageContent() {
  const [isAddChannelDialogOpen, setIsAddChannelDialogOpen] = useState(false);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelLink, setNewChannelLink] = useState('');
  const [allPublicChannels, setAllPublicChannels] = useState<Partial<IChannel>[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Partial<IChannel> | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [ratingChannel, setRatingChannel] = useState<Partial<IChannel> | null>(null);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [isPostAddDialogOpen, setIsPostAddDialogOpen] = useState(false);
  const [newlyAddedChannel, setNewlyAddedChannel] = useState<Partial<IChannel> | null>(null);
  const [orderedTabs, setOrderedTabs] = useState(TABS_DATA.map(t => t.value));
  const [customFolders, setCustomFolders] = useState<Record<string, string[]>>({});


  useEffect(() => {
    const storedFolders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '{}');
    setCustomFolders(storedFolders);

    const defaultTabs = TABS_DATA.map(t => t.value);
    const folderKeys = Object.keys(storedFolders);
    const allPossibleTabs = [...defaultTabs, ...folderKeys];

    const storedOrderStr = localStorage.getItem(TABS_ORDER_KEY);
    if (storedOrderStr) {
        try {
            const parsedOrder = JSON.parse(storedOrderStr);
            const currentTabValues = new Set(parsedOrder);
            const finalOrder = [...parsedOrder];
            allPossibleTabs.forEach(value => {
                if (!currentTabValues.has(value)) {
                    finalOrder.push(value);
                }
            });
            setOrderedTabs(finalOrder.filter(value => allPossibleTabs.includes(value)));
        } catch (e) {
            console.error("Failed to parse tabs order from storage", e);
            setOrderedTabs(allPossibleTabs);
        }
    } else {
        setOrderedTabs(allPossibleTabs);
    }
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && orderedTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, orderedTabs]);

  useEffect(() => {
    const fetchChannels = async () => {
        try {
            const response = await fetch('/api/channels');
            if (response.ok) {
                const data = await response.json();
                setAllPublicChannels(data);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Failed to load channels',
                    description: 'Could not fetch the list of public channels. Please try again later.'
                });
            }
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Network Error',
                description: 'Could not connect to the server to fetch channels.'
            });
        }
    };
    
    fetchChannels();
    
    const storedWatchlist: string[] = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
    setWatchlistIds(storedWatchlist);

  }, []);
  
  const { toast } = useToast();

  const handleAddChannel = async () => {
    let finalChannelLink = newChannelLink.trim();
    if (finalChannelLink === '') {
        toast({
            variant: 'destructive',
            title: 'Invalid Link',
            description: 'Please enter a Telegram channel link or username.',
        });
        return;
    }

    setIsAddingChannel(true);
    
    try {
        const response = await fetch('/api/analyze-channel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelUrl: finalChannelLink }),
        });
        
        const result = await response.json();

        if (response.ok && result.success) {
            const { channel, message } = result;

            if (!channel) {
                console.error("Channel data is missing in the API response!");
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: "Received an invalid response from the server."
                });
                setIsAddingChannel(false);
                setIsAddChannelDialogOpen(false);
                return;
            }
            
            toast({
                title: 'Request Sent',
                description: message
            });

            setAllPublicChannels(prev => {
                if (!channel || !channel.channelId) {
                    return prev;
                }
                const existingIndex = prev.findIndex(c => c && c.channelId && c.channelId.toLowerCase() === channel.channelId.toLowerCase());
                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...updated[existingIndex], ...channel };
                    return updated;
                }
                return [channel, ...prev];
            });

            if (channel._id && !watchlistIds.some(id => id.toString() === channel._id.toString())) {
                const updatedWatchlist = [...watchlistIds, channel._id.toString()];
                setWatchlistIds(updatedWatchlist);
                localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedWatchlist));
            }

            if (result.channel.isSignalChannel) {
                router.push(`/channel/${result.channel.channelId}`);
            } else if (result.channel.isSignalChannel === false) {
                 toast({
                    variant: 'default',
                    title: 'Not a Signal Channel',
                    description: `Our analysis indicates this is not a trading signal channel.`,
                });
            } else {
                 const category = preClassifyChannel(channel);
                 setActiveTab(category !== 'other' ? category : 'all');
            }


        } else {
            throw new Error(result.message || 'Failed to add channel');
        }

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Adding Channel',
            description: error.message || 'An unknown error occurred.',
        });
    } finally {
        setNewChannelLink('');
        setIsAddingChannel(false);
        setIsAddChannelDialogOpen(false);
    }
  }

  const handleDeleteUserAddedChannel = (id: string) => {
    setAllPublicChannels(prev => prev.filter(c => c?._id?.toString() !== id));
    toast({
        title: "Channel Removed (Client-side)",
        description: "In a real app, this would delete from the database."
    });
  }

  const handleAddToWatchlist = (channelId: string) => {
    const lowerCaseChannelId = channelId.toLowerCase();
    let updatedWatchlist = [...watchlistIds];
    if (updatedWatchlist.some(id => id.toLowerCase() === lowerCaseChannelId)) {
        updatedWatchlist = updatedWatchlist.filter(id => id.toLowerCase() !== lowerCaseChannelId);
        toast({ title: 'Removed from Watchlist' });
    } else {
        updatedWatchlist.push(lowerCaseChannelId);
        toast({ title: 'Added to Watchlist' });
    }
    setWatchlistIds(updatedWatchlist);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedWatchlist));
  };

  const preClassifyChannel = (channel: Partial<IChannel>): 'signals' | 'news' | 'insight' | 'airdrop' | 'other' => {
      const name = (channel.name || '').toLowerCase();
      const description = (channel.description || '').toLowerCase();
      const content = `${name} ${description}`;

      if (/\b(signal|trade|tread|tرید|سیگنال)\b/i.test(content)) return 'signals';
      if (/\b(news|اخبار)\b/i.test(content)) return 'news';
      if (/\b(whale|alert|insight|تحلیل)\b/i.test(content)) return 'insight';
      if (/\b(airdrop|ایردراپ)\b/i.test(content)) return 'airdrop';

      return 'other';
  };

  const handleAnalyze = (channel: Partial<IChannel>) => {
    setSelectedChannel(channel);
    setIsSheetOpen(true);
  };
  
  const handleRate = (channel: Partial<IChannel>) => {
    setRatingChannel(channel);
    setIsRatingDialogOpen(true);
  };

  const handleRateSubmit = (rating: number) => {
    if (rating > 0) {
      toast({
        title: "Rating Submitted!",
        description: `You gave ${ratingChannel?.name} a ${rating}-star rating.`,
      });
    }
    setIsRatingDialogOpen(false);
  };

  const handlePostAddAnalyze = () => {
    setIsPostAddDialogOpen(false);
    if(newlyAddedChannel?.channelId) {
        router.push(`/channel/${newlyAddedChannel.channelId}`);
    }
  };
  
  const filterChannels = (category: 'signals' | 'news' | 'insight' | 'airdrop' | string) => {
      if (TABS_DATA.some(t => t.value === category)) {
          return allPublicChannels.filter(channel => {
            if (!channel) return false;
            const content = `${channel.name?.toLowerCase() || ''} ${channel.description?.toLowerCase() || ''}`;
            switch(category) {
                case 'signals': return /\b(signal|trade|tread|tرید|سیگنال)\b/i.test(content);
                case 'news': return /\b(news|اخبار)\b/i.test(content);
                case 'insight': return /\b(whale|alert|insight|تحلیل)\b/i.test(content);
                case 'airdrop': return /\b(airdrop|ایردراپ)\b/i.test(content);
                default: return false;
            }
          });
      }
      const channelIds = customFolders[category] || [];
      return allPublicChannels.filter(channel => channel?._id && channelIds.includes(channel._id.toString()));
  }


  const getTabLabel = (tabValue: string) => {
    const defaultTab = TABS_DATA.find(t => t.value === tabValue);
    return defaultTab ? t(defaultTab.labelKey) : tabValue;
  }

  return (
    <>
      <div 
          className="flex flex-col min-h-screen bg-background font-body"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow flex flex-col">
            <AppHeader open={isSettingsSheetOpen} onOpenChange={setIsSettingsSheetOpen}>
              <div className="w-full">
                <TabsList className={cn("bg-transparent p-0 h-auto w-full", language === 'fa' ? "justify-end" : "justify-start")}>
                  {orderedTabs.map(tabValue => (
                      <TabsTrigger key={tabValue} value={tabValue} className="header-tabs-trigger">
                          {getTabLabel(tabValue)}
                      </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </AppHeader>
            <main className="flex-grow container mx-auto max-w-2xl px-4 pb-4 pt-2 flex flex-col relative z-10">
                <TabsContent value="all" className="flex-grow">
                    <div className="pt-4 space-y-3">
                      {allPublicChannels.length > 0 ? (
                        allPublicChannels.filter(c => c && c._id).map((channel) => (
                          <ChannelListItem key={channel._id!.toString()} channel={channel as Omit<Partial<IChannel>, '_id'> & { _id: any }} onAnalyze={handleAnalyze} isUserAdded={!channel.isStatic} onDelete={handleDeleteUserAddedChannel} onAddToWatchlist={handleAddToWatchlist} isWatchlisted={watchlistIds.includes(channel.channelId!.toLowerCase())} onRate={handleRate} />
                        ))
                      ) : (
                        <Card className="p-6 text-center text-muted-foreground">
                          No channels found.
                        </Card>
                      )}
                    </div>
                </TabsContent>
                
                {orderedTabs.filter(t => t !== 'all').map(tabValue => {
                    const channels = filterChannels(tabValue as any);
                    let emptyStateMessage = `No channels found for ${getTabLabel(tabValue)}.`;
                    if (tabValue === 'airdrop') {
                        emptyStateMessage = t('telegram_channels.airdrop_empty_state');
                    }

                    return (
                        <TabsContent key={tabValue} value={tabValue} className="flex-grow">
                            <div className="pt-4 space-y-3">
                                {channels.length > 0 ? (
                                    channels.filter(c => c && c._id).map((channel) => (
                                        <ChannelListItem key={channel._id!.toString()} channel={channel as Omit<Partial<IChannel>, '_id'> & { _id: any }} onAnalyze={handleAnalyze} isUserAdded={!channel.isStatic} onDelete={handleDeleteUserAddedChannel} onAddToWatchlist={handleAddToWatchlist} isWatchlisted={watchlistIds.includes(channel.channelId!.toLowerCase())} onRate={handleRate} />
                                    ))
                                ) : (
                                    <Card className={cn("p-6 text-center text-muted-foreground", language === 'fa' && 'rtl-text')}>
                                        {emptyStateMessage}
                                    </Card>
                                )}
                            </div>
                        </TabsContent>
                    )
                })}
            </main>
        </Tabs>
        <div className="fixed bottom-4 right-4 z-30">
          <Dialog open={isAddChannelDialogOpen} onOpenChange={setIsAddChannelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="icon" className="h-14 w-14 shrink-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full shadow-lg">
                <Plus className="h-7 w-7" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className={cn(language === 'fa' && 'rtl-text')}>{t('telegram_channels.add_channel_title')}</DialogTitle>
                <DialogDescription className={cn(language === 'fa' && 'rtl-text')}>
                  {t('telegram_channels.add_channel_desc')}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="channel-link" className="sr-only">Channel Link</Label>
                <Input
                  id="channel-link"
                  placeholder="e.g., CryptoSignals or https://t.me/..."
                  value={newChannelLink}
                  onChange={(e) => setNewChannelLink(e.target.value)}
                  disabled={isAddingChannel}
                />
              </div>
              <DialogFooter className="flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddChannelDialogOpen(false)} disabled={isAddingChannel}>{t('telegram_channels.cancel')}</Button>
                <Button onClick={handleAddChannel} disabled={isAddingChannel}>
                  {isAddingChannel && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('telegram_channels.add_channel_button')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <MarketInsightsSheet 
          channel={selectedChannel}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
      />
       <RatingDialog 
          channel={ratingChannel}
          open={isRatingDialogOpen}
          onOpenChange={setIsRatingDialogOpen}
          onRateSubmit={handleRateSubmit}
      />
      <Dialog open={isPostAddDialogOpen} onOpenChange={setIsPostAddDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <div className="mx-auto w-20 h-20 mb-4">
                      <Avatar className="w-full h-full">
                          <AvatarImage src={newlyAddedChannel?.avatar} />
                          <AvatarFallback>{newlyAddedChannel?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                  </div>
                  <DialogTitle className="text-center">Channel Added!</DialogTitle>
                   <DialogDescription className="text-center">
                      "{newlyAddedChannel?.name}" has been added and will be analyzed in the background.
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                   <Button variant="secondary" onClick={() => handlePostAddAnalyze()}>OK</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}

export default function TelegramChannelsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TelegramChannelsPageContent />
    </Suspense>
  )
}
