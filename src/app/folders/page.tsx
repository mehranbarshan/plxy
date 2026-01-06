"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Grip, MoreVertical, Pencil, Trash2, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


const TABS_ORDER_KEY = 'tradeview_tabs_order';
const FOLDERS_KEY = 'tradeview_watchlist_folders';

const TABS_DATA = [
  { value: 'all', labelKey: 'telegram_channels.tab_all' },
  { value: 'signals', labelKey: 'telegram_channels.tab_signals' },
  { value: 'news', labelKey: 'telegram_channels.tab_crypto_news' },
  { value: 'airdrop', labelKey: 'telegram_channels.tab_airdrop' },
  { value: 'insight', labelKey: 'telegram_channels.tab_insight' },
];

export default function ManageFoldersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { t, language } = useTranslation();
    const [tabsOrder, setTabsOrder] = useState<string[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    
    const draggedItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const [isRenameFolderOpen, setIsRenameFolderOpen] = useState(false);
    const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [customFolders, setCustomFolders] = useState<string[]>([]);

    useEffect(() => {
        setIsMounted(true);
        const defaultTabs = TABS_DATA.map(t => t.value);
        
        const storedFoldersStr = localStorage.getItem(FOLDERS_KEY);
        const storedFolders = storedFoldersStr ? Object.keys(JSON.parse(storedFoldersStr)) : [];
        setCustomFolders(storedFolders);

        const allPossibleTabs = [...defaultTabs, ...storedFolders];
        
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
                setTabsOrder(finalOrder.filter(value => allPossibleTabs.includes(value)));
            } catch (e) {
                console.error("Failed to parse tabs order from storage", e);
                setTabsOrder(allPossibleTabs);
            }
        } else {
            setTabsOrder(allPossibleTabs);
        }
    }, []);

    const handleDragSort = () => {
        if (draggedItem.current === null || dragOverItem.current === null) return;
        
        // Prevent "All" tab from being moved
        if (draggedItem.current === 0 || dragOverItem.current === 0) {
            draggedItem.current = null;
            dragOverItem.current = null;
            toast({ variant: 'destructive', title: "Cannot Move 'All' Tab" });
            return;
        }

        const newTabsOrder = [...tabsOrder];
        const draggedItemContent = newTabsOrder.splice(draggedItem.current, 1)[0];
        newTabsOrder.splice(dragOverItem.current, 0, draggedItemContent);
        
        draggedItem.current = null;
        dragOverItem.current = null;
        
        setTabsOrder(newTabsOrder);
        localStorage.setItem(TABS_ORDER_KEY, JSON.stringify(newTabsOrder));
        toast({ title: t('folders_page.save_order'), description: t('folders_page.save_order_desc') });
    };

    const openRenameDialog = (name: string) => {
        setFolderToEdit(name);
        setNewFolderName(name);
        setIsRenameFolderOpen(true);
    };

    const handleRenameFolder = () => {
        if (!folderToEdit || !newFolderName.trim()) return;
        
        const newName = newFolderName.trim();
        if (folderToEdit === newName) {
            setIsRenameFolderOpen(false);
            return;
        }
        
        const storedFolders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '{}');
        if(storedFolders[newName]) {
            toast({ variant: 'destructive', title: "Folder name already exists" });
            return;
        }
        
        storedFolders[newName] = storedFolders[folderToEdit];
        delete storedFolders[folderToEdit];
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(storedFolders));
        
        const newTabsOrder = tabsOrder.map(tab => tab === folderToEdit ? newName : tab);
        setTabsOrder(newTabsOrder);
        localStorage.setItem(TABS_ORDER_KEY, JSON.stringify(newTabsOrder));
        
        setCustomFolders(Object.keys(storedFolders));
        toast({ title: t('your_channels.toast_list_renamed') });
        setIsRenameFolderOpen(false);
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
        
        const newTabsOrder = tabsOrder.filter(tab => tab !== folderToEdit);
        setTabsOrder(newTabsOrder);
        localStorage.setItem(TABS_ORDER_KEY, JSON.stringify(newTabsOrder));
        
        setCustomFolders(Object.keys(storedFolders));
        toast({ title: t('your_channels.toast_list_deleted'), variant: 'destructive' });
        setIsDeleteFolderOpen(false);
    };

    const getTabLabel = (tabValue: string) => {
        const defaultTab = TABS_DATA.find(t => t.value === tabValue);
        return defaultTab ? t(defaultTab.labelKey) : tabValue;
    }
    
    const isCustomFolder = (tabValue: string) => {
        return customFolders.includes(tabValue);
    };

    if (!isMounted) {
        return null;
    }

    return (
        <>
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className={cn("sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-blue-500 text-white", language === 'fa' && 'flex-row-reverse')}>
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
                    <ArrowLeft className={cn("w-5 h-5", language === 'fa' && "rotate-180")} />
                </Button>
                <h1 className="text-lg font-bold">{t('folders_page.title')}</h1>
            </header>
            <main className={cn("flex-grow container mx-auto max-w-2xl px-4 pt-6 pb-4", language === 'fa' && 'rtl')}>
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="p-3 bg-secondary rounded-full mb-4">
                        <Folder className="w-10 h-10 text-primary" />
                    </div>
                    <p className={cn("text-muted-foreground", language === 'fa' && 'rtl-text')}>{t('folders_page.description')}</p>
                </div>

                <div className="space-y-4">
                    <h2 className={cn("font-semibold text-primary px-2", language === 'fa' && 'text-right')}>{t('folders_page.list_title')}</h2>
                    <div className="bg-card rounded-2xl">
                        {tabsOrder.map((tabValue, index) => {
                            const isDraggable = tabValue !== 'all';
                            const isCustom = isCustomFolder(tabValue);

                            return (
                                <div 
                                    key={tabValue}
                                    draggable={isDraggable}
                                    onDragStart={isDraggable ? () => (draggedItem.current = index) : undefined}
                                    onDragEnter={isDraggable ? () => (dragOverItem.current = index) : undefined}
                                    onDragEnd={isDraggable ? handleDragSort : undefined}
                                    onDragOver={isDraggable ? (e) => e.preventDefault() : undefined}
                                    className="relative group"
                                >
                                    <div className={cn("flex items-center p-3 rounded-lg", language === 'fa' && 'flex-row-reverse')}>
                                        <div className={cn("flex items-center gap-4 flex-grow", language === 'fa' && 'flex-row-reverse')}>
                                            {isDraggable ? <Grip className={cn("w-5 h-5 text-muted-foreground cursor-grab")} /> : <div className="w-5 h-5"></div>}
                                            {isCustom && <Folder className="w-5 h-5 text-muted-foreground" />}
                                            <span className="font-medium">{getTabLabel(tabValue)}</span>
                                        </div>
                                        {isDraggable && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0">
                                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align={language === 'fa' ? 'start' : 'end'}>
                                                    <DropdownMenuItem onClick={() => openRenameDialog(tabValue)}>
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        {t('folders_page.rename')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openDeleteDialog(tabValue)} className="text-destructive">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        {t('folders_page.delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                    {index < tabsOrder.length - 1 && <Separator />}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-card rounded-2xl mt-4">
                    <div 
                        className={cn("flex items-center p-4 cursor-pointer", language === 'fa' && 'flex-row-reverse')}
                        onClick={() => router.push('/folders/create')}
                    >
                        <div className={cn("flex items-center gap-4", language === 'fa' && 'flex-row-reverse')}>
                            <PlusCircle className="w-6 h-6 text-primary" />
                            <span className="font-medium text-primary">{t('folders_page.create_folder')}</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
        <Dialog open={isRenameFolderOpen} onOpenChange={setIsRenameFolderOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('your_channels.rename_list_title')}</DialogTitle>
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

        <AlertDialog open={isDeleteFolderOpen} onOpenChange={setIsDeleteFolderOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('your_channels.delete_list_title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                       {t('your_channels.delete_list_desc', { folderName: getTabLabel(folderToEdit || '')})}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('your_channels.cancel_button')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{t('your_channels.delete_button')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
