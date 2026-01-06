

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Trash2, Star, Search, Plus, Folder, ArrowUpDown, History, MoreVertical, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { type Channel, channels as staticChannels } from '@/lib/channel-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/context/LanguageContext';
import ChannelListItem from '@/components/tradeview/channel-list-item';
import { cn } from '@/lib/utils';

const WATCHLIST_KEY = 'tradeview_watchlist_channels';
const USER_ADDED_CHANNELS_KEY = 'tradeview_user_added_channels';
const FOLDERS_KEY = 'tradeview_watchlist_folders';

const FolderItem = ({ name, onRename, onDelete }: { name: string, onRename: (oldName: string) => void, onDelete: (name: string) => void }) => {
    const { language } = useTranslation();
    return (
        <Card className="p-3 rounded-xl hover:bg-secondary transition-colors">
            <div className={cn("flex items-center gap-4", language === 'fa' && 'flex-row-reverse')}>
                <div className="h-10 w-10 flex items-center justify-center bg-secondary rounded-lg">
                    <Folder className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className={cn("font-semibold text-sm flex-grow cursor-pointer", language === 'fa' && 'text-right')}>{name}</span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={language === 'fa' ? 'start' : 'end'}>
                        <DropdownMenuItem onClick={() => onRename(name)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(name)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    )
}

export default function YourChannelsPage() {
    const router = useRouter();
    const [watchlist, setWatchlist] = useState<Partial<Channel>[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const { toast } = useToast();
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isRenameFolderOpen, setIsRenameFolderOpen] = useState(false);
    const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [channelSort, setChannelSort] = useState<'asc' | 'desc'>('asc');
    const { t, language } = useTranslation();

    useEffect(() => {
        const storedIds: string[] = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
        const userAddedChannels: Partial<Channel>[] = JSON.parse(localStorage.getItem(USER_ADDED_CHANNELS_KEY) || '[]');
        const allAvailableChannels = [...staticChannels, ...userAddedChannels];
        const channels = allAvailableChannels.filter(c => storedIds.includes(c.id!));
        setWatchlist(channels);
        
        const storedFoldersData = localStorage.getItem(FOLDERS_KEY);
        if (storedFoldersData) {
            try {
                const parsedFolders = JSON.parse(storedFoldersData);
                // Check if it's the old array format or the new object format
                if (Array.isArray(parsedFolders)) {
                    setFolders(parsedFolders);
                } else if (typeof parsedFolders === 'object') {
                    setFolders(Object.keys(parsedFolders));
                }
            } catch (e) {
                console.error("Failed to parse folders from storage", e);
                setFolders([]);
            }
        }
        
        setLoading(false);
    }, []);

    const handleRemove = (channelId: string) => {
        const updatedWatchlist = watchlist.filter(c => c.id !== channelId);
        const updatedIds = updatedWatchlist.map(c => c.id);
        setWatchlist(updatedWatchlist);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedIds));
        toast({
            title: t('your_channels.toast_channel_removed'),
            description: t('your_channels.toast_channel_removed_desc'),
        });
    };
    
    const handleCreateFolder = () => {
        if (newFolderName.trim() === '') {
            toast({
                variant: 'destructive',
                title: t('your_channels.toast_invalid_name'),
            });
            return;
        }
        
        const storedFolders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '{}');
        storedFolders[newFolderName.trim()] = []; // New folder is empty initially
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(storedFolders));
        setFolders(Object.keys(storedFolders));

        toast({
            title: t('your_channels.toast_list_created'),
            description: t('your_channels.toast_list_created_desc', {folderName: newFolderName}),
        });
        setNewFolderName('');
        setIsCreateFolderOpen(false);
    }
    
    const openRenameDialog = (name: string) => {
        setFolderToEdit(name);
        setNewFolderName(name);
        setIsRenameFolderOpen(true);
    };

    const handleRenameFolder = () => {
        if (!folderToEdit || newFolderName.trim() === '') {
            toast({ variant: 'destructive', title: "Invalid Name" });
            return;
        }
        const storedFolders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '{}');
        if (folderToEdit !== newFolderName.trim()) {
            storedFolders[newFolderName.trim()] = storedFolders[folderToEdit];
            delete storedFolders[folderToEdit];
        }
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(storedFolders));
        setFolders(Object.keys(storedFolders));
        
        toast({ title: t('your_channels.toast_list_renamed') });
        setIsRenameFolderOpen(false);
        setFolderToEdit(null);
        setNewFolderName('');
    };

    const openDeleteDialog = (name: string) => {
        setFolderToEdit(name);
        setIsDeleteFolderOpen(true);
    };

    const handleDeleteFolder = () => {
        if (!folderToEdit) return;
        
        const storedFolders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '{}');
        delete storedFolders[folderToEdit];
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(storedFolders));
        setFolders(Object.keys(storedFolders));

        toast({ title: t('your_channels.toast_list_deleted'), variant: 'destructive' });
        setIsDeleteFolderOpen(false);
        setFolderToEdit(null);
    };


    const filteredWatchlist = watchlist
        .filter(channel => 
            channel.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const nameA = a.name || '';
            const nameB = b.name || '';
            if (channelSort === 'asc') {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(a.name || '');
            }
        });

    const sortedFolders = [...folders].sort((a, b) => a.localeCompare(b));
    
    const handleSearchToggle = () => {
        setIsSearchVisible(!isSearchVisible);
        if (isSearchVisible) {
            setSearchQuery('');
        }
    }

    const handleMainClick = () => {
        if (isSearchVisible) {
            setIsSearchVisible(false);
            setSearchQuery('');
        }
    }

    const recentlyAddedChannels = watchlist.slice(0, 3);

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className={cn("sticky top-0 z-10 p-4 flex items-center justify-between container mx-auto max-w-2xl bg-blue-500 text-white", language === 'fa' && 'flex-row-reverse')}>
                {!isSearchVisible && (
                     <>
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
                            <ArrowLeft className={cn("w-5 h-5", language === 'fa' && 'rotate-180')} />
                        </Button>
                        <h1 className="text-lg font-bold">{t('your_channels.title')}</h1>
                        <div className={cn("flex items-center gap-2", language === 'fa' && 'flex-row-reverse')}>
                            <Button variant="ghost" size="icon" onClick={handleSearchToggle} className="text-white hover:bg-white/10">
                                <Search className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => router.push('/folders/create')} className="text-white hover:bg-white/10">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </>
                )}
                {isSearchVisible && (
                    <div className="w-full flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleSearchToggle} className="text-white hover:bg-white/10">
                            <ArrowLeft className={cn("w-5 h-5", language === 'fa' && 'rotate-180')} />
                        </Button>
                        <div className="relative w-full">
                            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", language === 'fa' ? 'right-3' : 'left-3')} />
                             <Input 
                                placeholder={t('your_channels.search_placeholder')} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    "bg-white/20 text-white placeholder:text-white/70 border-white/30 focus-visible:ring-white",
                                    language === 'fa' ? 'pr-9 rtl-text' : 'pl-9'
                                )}
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-grow container mx-auto max-w-2xl px-4 pt-4 pb-4" onClick={handleMainClick}>
                {loading ? (
                    <p>{t('your_channels.loading')}</p>
                ) : watchlist.length > 0 || folders.length > 0 ? (
                    <div className="space-y-6">
                        {folders.length > 0 && (
                             <div>
                                <div className={cn("flex items-center justify-start gap-4 mb-3", language === 'fa' && 'flex-row-reverse justify-end')}>
                                    <h2 className="text-lg font-semibold">
                                        {t('your_channels.your_lists')}
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    {sortedFolders.map(folderName => (
                                        <FolderItem 
                                            key={folderName} 
                                            name={folderName} 
                                            onRename={openRenameDialog}
                                            onDelete={openDeleteDialog}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {filteredWatchlist.length > 0 && (
                            <div>
                                <div className={cn("flex items-center justify-between mb-3", language === 'fa' && 'flex-row-reverse')}>
                                     <div className={cn("flex items-center justify-start gap-4", language === 'fa' && 'flex-row-reverse')}>
                                        <h2 className="text-lg font-semibold">
                                            {t('your_channels.recently_added')}
                                        </h2>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setChannelSort(prev => prev === 'asc' ? 'desc' : 'asc')}>
                                        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {filteredWatchlist.map(channel => (
                                        <ChannelListItem key={channel.id} channel={channel} onRemove={handleRemove} showExtraActions={true}/>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <Card className="p-6 text-center text-muted-foreground border-dashed">
                        <Star className="mx-auto w-8 h-8 mb-2 text-yellow-500/50" />
                        <h3 className="font-semibold">{t('your_channels.empty_state_title')}</h3>
                        <p className="text-sm mt-1 mb-4">{t('your_channels.empty_state_desc')}</p>
                        <Link href="/telegram-channels">
                            <Button variant="outline">{t('your_channels.browse_channels_button')}</Button>
                        </Link>
                    </Card>
                )}
            </main>

            {/* Rename Dialog */}
            <Dialog open={isRenameFolderOpen} onOpenChange={setIsRenameFolderOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('your_channels.rename_list_title')}</DialogTitle>
                        <DialogDescription>
                            {t('your_channels.rename_list_desc', { folderName: folderToEdit || '' })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder={t('your_channels.list_name_placeholder')}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenameFolderOpen(false)}>{t('your_channels.cancel_button')}</Button>
                        <Button onClick={handleRenameFolder}>{t('your_channels.save_button')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteFolderOpen} onOpenChange={setIsDeleteFolderOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('your_channels.delete_list_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('your_channels.delete_list_desc', { folderName: folderToEdit || '' })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('your_channels.cancel_button')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{t('your_channels.delete_button')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
