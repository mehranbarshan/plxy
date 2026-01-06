"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Channel, channels as staticChannels } from '@/lib/channel-data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';


const FOLDERS_KEY = 'tradeview_watchlist_folders';
const WATCHLIST_KEY = 'tradeview_watchlist_channels';
const TABS_ORDER_KEY = 'tradeview_tabs_order';

const TABS_DATA = [
  { value: 'all', labelKey: 'telegram_channels.tab_all' },
  { value: 'signals', labelKey: 'telegram_channels.tab_signals' },
  { value: 'news', labelKey: 'telegram_channels.tab_crypto_news' },
  { value: 'airdrop', labelKey: 'telegram_channels.tab_airdrop' },
  { value: 'insight', labelKey: 'telegram_channels.tab_insight' },
];


const ChannelSelectItem = ({ channel, onSelect, isSelected }: { channel: Partial<Channel>, onSelect: (id: string, selected: boolean) => void, isSelected: boolean }) => {
    return (
        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary">
            <Avatar className="h-10 w-10">
                <AvatarImage src={channel.avatar} />
                <AvatarFallback>{channel.name?.charAt(0) || <Send />}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <p className="font-semibold text-sm">{channel.name}</p>
                <p className="text-xs text-muted-foreground">{channel.subscribers} subscribers</p>
            </div>
            <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(channel.id!, !!checked)}
            />
        </div>
    )
}

export default function CreateFolderPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { t, language } = useTranslation();
    const [folderName, setFolderName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [allChannels, setAllChannels] = useState<Partial<Channel>[]>([]);
    const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await fetch('/api/channels');
                if (response.ok) {
                    const data: Partial<Channel>[] = await response.json();
                    setAllChannels(data);
                } else {
                    setAllChannels(staticChannels); // Fallback to static
                }
            } catch (error) {
                setAllChannels(staticChannels); // Fallback on network error
            }
        };
        fetchChannels();
    }, []);

    const handleChannelSelect = (id: string, selected: boolean) => {
        setSelectedChannelIds(prev =>
            selected ? [...prev, id] : prev.filter(channelId => channelId !== id)
        );
    };

    const handleSaveFolder = () => {
        if (folderName.trim() === '') {
            toast({
                variant: 'destructive',
                title: t('your_channels.toast_invalid_name'),
            });
            return;
        }

        if (selectedChannelIds.length === 0) {
            toast({
                variant: 'destructive',
                title: "No Channels Selected",
                description: "Please select at least one channel for the folder.",
            });
            return;
        }

        const uniqueFolderName = folderName.trim();
        
        // Check for duplicate folder names against default tabs and custom folders
        const defaultTabLabels = TABS_DATA.map(tab => t(tab.labelKey).toLowerCase());
        const storedFolders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '{}');
        const customFolderNames = Object.keys(storedFolders).map(name => name.toLowerCase());

        if (defaultTabLabels.includes(uniqueFolderName.toLowerCase()) || customFolderNames.includes(uniqueFolderName.toLowerCase())) {
            toast({
                variant: 'destructive',
                title: "Folder Already Exists",
                description: `A folder or default tab named "${uniqueFolderName}" already exists. Please choose a different name.`,
            });
            return;
        }
        
        storedFolders[uniqueFolderName] = selectedChannelIds;
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(storedFolders));

        // Add to tab order
        const storedOrder = JSON.parse(localStorage.getItem(TABS_ORDER_KEY) || '[]');
        if (!storedOrder.includes(uniqueFolderName)) {
            const newOrder = [...storedOrder, uniqueFolderName];
            localStorage.setItem(TABS_ORDER_KEY, JSON.stringify(newOrder));
        }

        toast({
            title: t('your_channels.toast_list_created'),
            description: `${t('your_channels.toast_list_created_desc', { folderName: uniqueFolderName })} with ${selectedChannelIds.length} channels.`,
        });

        router.push('/telegram-channels');
    };
    
    const filteredChannels = useMemo(() => {
        return allChannels.filter(channel => 
            channel.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allChannels, searchQuery]);

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className={cn("sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-blue-500 text-white", language === 'fa' && 'flex-row-reverse')}>
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
                    <ArrowLeft className={cn("w-5 h-5", language === 'fa' && "rotate-180")} />
                </Button>
                <h1 className="text-lg font-bold">{t('your_channels.create_list_title')}</h1>
            </header>
            <main className="flex-grow container mx-auto max-w-2xl p-4 space-y-6">
                <Card>
                    <CardContent className="p-4">
                        <Label htmlFor="folder-name" className={cn("font-semibold", language === 'fa' && 'text-right block')}>{t('your_channels.list_name_label')}</Label>
                        <Input
                            id="folder-name"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            placeholder={t('your_channels.list_name_placeholder')}
                            className={cn("mt-2", language === 'fa' && 'rtl-text')}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className={cn("font-semibold mb-4", language === 'fa' && 'text-right block')}>{t('your_channels.add_channels_title')}</p>
                        <div className="relative mb-4">
                            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", language === 'fa' ? 'right-3' : 'left-3')} />
                            <Input
                                placeholder={t('your_channels.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(language === 'fa' ? 'pr-9 rtl-text' : 'pl-9')}
                            />
                        </div>

                        <ScrollArea className="h-72">
                            <div className="space-y-2">
                                {filteredChannels.map(channel => (
                                    <ChannelSelectItem
                                        key={channel.id}
                                        channel={channel}
                                        onSelect={handleChannelSelect}
                                        isSelected={selectedChannelIds.includes(channel.id!)}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Button className="w-full h-12" onClick={handleSaveFolder}>
                    {t('your_channels.save_button')}
                </Button>
            </main>
        </div>
    );
}
