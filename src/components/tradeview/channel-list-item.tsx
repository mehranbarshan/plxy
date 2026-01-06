

'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { PlusCircle, Filter, Users, User, Loader2, Star, Send, Trash2, Plus, MoreVertical } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
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
import { useRouter } from "next/navigation";


const formatSubscribers = (subs: string | number | undefined, t: (key: string, values?: Record<string, string | number>) => string, formatNumber: (num: number) => string): string => {
    if (typeof subs === 'string') return subs;
    if (typeof subs === 'undefined' || subs === null || isNaN(subs)) return t('search_page.unknown_subscribers');
    return t('channel_detail.subscriber_count', { count: formatNumber(subs) });
};

interface ChannelListItemProps {
    channel: Partial<IChannel> & { _id: any };
    onAnalyze?: (channel: Partial<IChannel>) => void;
    isUserAdded?: boolean;
    onDelete?: (id: string) => void;
    onAddToWatchlist?: (id: string) => void;
    isWatchlisted?: boolean;
    onRate?: (channel: Partial<IChannel>) => void;
    onRemove?: (id: string) => void; // For your-channels page
    showExtraActions?: boolean;
}


export default function ChannelListItem({ 
    channel, 
    onAnalyze, 
    isUserAdded = false, 
    onDelete, 
    onAddToWatchlist, 
    isWatchlisted, 
    onRate, 
    onRemove,
    showExtraActions = false
}: ChannelListItemProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { t, language, formatNumber } = useTranslation();

    const handleJoin = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (channel.url) {
            window.open(channel.url, '_blank');
        } else {
            toast({
                title: t('channel_detail.toast.joining_demo_title'),
                description: t('channel_detail.toast.joining_demo_desc', { channelName: channel.name || '' })
            });
        }
    }

    const rating = channel.rating || 0;
    const subscribersText = formatSubscribers(channel.subscribers, t, formatNumber);

    return (
      <Link href={`/channel/${channel.channelId}`} className="block">
        <Card className="p-3 rounded-2xl overflow-hidden w-full bg-card shadow-sm cursor-pointer hover:bg-secondary/50 transition-colors">
            <div className={cn("flex items-start gap-3", language === 'fa' ? 'flex-row-reverse' : '')}>
                <div className={cn("flex items-start gap-3 flex-grow min-w-0", language === 'fa' ? 'flex-row-reverse' : '')}>
                    <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={channel.avatar || 'https://asset.gaminvest.org/asset/social-trading/telegram.png'} />
                        <AvatarFallback>
                            {channel.name ? channel.name.charAt(0) : <Send />}
                        </AvatarFallback>
                    </Avatar>
                    <div className={cn("flex-grow min-w-0", language === 'fa' ? 'text-right' : '')}>
                        <h3 className={cn("font-bold text-sm truncate flex items-center gap-1.5", language === 'fa' ? 'justify-end' : '')}>
                            {channel.name}
                        </h3>
                        <div className={cn("flex items-center gap-1.5 mt-1 text-xs text-muted-foreground", language === 'fa' ? 'flex-row-reverse justify-end' : '')}>
                            {rating > 0 && (
                                <>
                                    <span className="font-bold text-xs text-foreground">{!isNaN(rating) ? formatNumber(rating) : ''}</span>
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                </>
                            )}
                            <span className="text-xs">({subscribersText})</span>
                        </div>
                    </div>
                </div>
                <div className={cn("flex items-center justify-start gap-2", language === 'fa' ? 'flex-row-reverse' : '')}>
                    <Button size="sm" onClick={handleJoin} className="h-8 text-xs px-3 w-full">{t('search_page.join_button')}</Button>
                </div>
            </div>
            {channel.description && (
                <>
                    <Separator className="my-2" />
                    <p className={cn("text-xs text-muted-foreground mt-2 line-clamp-2", language === 'fa' ? 'text-right' : 'text-left')}>
                        {channel.description}
                    </p>
                </>
            )}
        </Card>
      </Link>
    );
};
