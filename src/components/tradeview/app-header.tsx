

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Bell, Headphones, ArrowLeft, Wallet, Trophy, Gem, Menu, MoreVertical } from "lucide-react"
import { Button } from "../ui/button"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card } from "../ui/card"
import type { Member } from "@/lib/member-data"
import InstallPwaButton from "./install-pwa-button"
import SettingsSheet from "./settings-sheet"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { useTranslation } from "@/context/LanguageContext";


const USERNAME_KEY = 'tradeview_username';
const AVATAR_KEY = 'tradeview_avatar';

interface AppHeaderProps {
    showBackButton?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

const ConnectingIndicator = () => {
    return (
        <div className="font-display text-lg font-bold tracking-wider flex items-center gap-1">
            Connecting
            <span className="animate-pulse delay-0">.</span>
            <span className="animate-pulse delay-150">.</span>
            <span className="animate-pulse delay-300">.</span>
        </div>
    )
}

export default function AppHeader({ showBackButton = false, open, onOpenChange, children }: AppHeaderProps) {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const [isOnline, setIsOnline] = useState(true);
    const { language } = useTranslation();

     useEffect(() => {
        if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
            setIsOnline(window.navigator.onLine);

            const handleOnline = () => setIsOnline(true);
            const handleOffline = () => setIsOnline(false);

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);


    const handleActionClick = (feature: string) => {
        toast({
            title: "Feature not available",
            description: `The "${feature}" feature is for demonstration purposes.`,
        })
    }

    const isTelegramChannelsPage = pathname === '/telegram-channels';

    if (pathname === '/profile') {
        return null;
    }
    
    return (
        <header className="sticky top-0 z-20 bg-blue-500 dark:bg-background text-white dark:text-inherit">
            <div className="container mx-auto max-w-2xl px-4 pt-4 pb-2">
                <div className="flex items-center justify-between">
                    <div className="w-1/3 flex justify-start -ml-[5px]">
                        {isTelegramChannelsPage && onOpenChange ? (
                            <SettingsSheet open={open} onOpenChange={onOpenChange} />
                        ) : showBackButton ? (
                            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white dark:text-muted-foreground hover:bg-transparent dark:hover:bg-transparent hover:text-white dark:hover:text-foreground">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        ) : (
                        <SettingsSheet />
                        )}
                    </div>

                    <div className="w-1/3 flex justify-center">
                        {isTelegramChannelsPage && (
                            isOnline ? (
                                <div className="font-display text-2xl font-bold tracking-wider text-white">
                                    Plxy
                                </div>
                            ) : (
                            <ConnectingIndicator />
                            )
                        )}
                    </div>
                    
                    <div className={cn("w-1/3 flex items-center", language === 'fa' ? 'justify-end gap-2' : 'justify-end gap-2')}>
                        <Button variant="ghost" size="icon" className="h-11 w-11 text-white dark:text-muted-foreground hover:bg-transparent dark:hover:bg-transparent hover:text-white dark:hover:text-foreground" onClick={() => router.push('/search')}>
                            <Search className="h-6 w-6" />
                            <span className="sr-only">Search</span>
                        </Button>
                        <InstallPwaButton />
                    </div>
                </div>
            </div>
            {children && (
                 <ScrollArea className="w-full whitespace-nowrap">
                    <div className="px-4">
                        {children}
                    </div>
                    <ScrollBar orientation="horizontal" className="h-0" />
                </ScrollArea>
            )}
        </header>
    )
}
