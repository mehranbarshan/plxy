
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { emojis as staticEmojis, type Emoji } from '@/lib/emoji-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

const PURCHASED_EMOJIS_KEY = 'tradeview_purchased_emojis';
const SELECTED_EMOJI_KEY = 'tradeview_selected_emoji';

const EmojiGridItem = ({ emoji, onPurchase, isPurchasedView, isSelected, onApply }: { emoji: Emoji; onPurchase: (emoji: Emoji) => void; isPurchasedView: boolean; isSelected: boolean; onApply: (emoji: string) => void; }) => {
  const [purchaseState, setPurchaseState] = useState<'purchase' | 'applying' | 'continue'>('purchase');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handlePurchaseClick = () => {
    onPurchase(emoji);
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
    onApply(emoji.emoji);
    toast({
        title: "Emoji Applied!",
        description: "Your new emoji is now active on your profile."
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
      return `$${emoji.price.toLocaleString()}`;
  }

  const cardContent = (
     <Card className={cn("relative rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-secondary transition-colors aspect-square", isSelected && isPurchasedView ? 'border-green-500' : '')}>
        <div className="text-5xl">
          {emoji.emoji}
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
          <div className="text-6xl text-center mx-auto mb-4">
             {emoji.emoji}
          </div>
          <DialogTitle className="text-center">{emoji.name}</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-center">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-2xl font-bold">${emoji.price.toLocaleString()}</p>
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
                <Skeleton className="h-16 w-16" />
                <Skeleton className="h-5 w-20" />
             </Card>
        ))}
    </div>
)

interface EmojisListProps {
    searchQuery: string;
    onSearchChange?: (query: string) => void;
    onPurchaseSuccess: () => void;
    purchasedEmojis: string[];
    showOnlyPurchased?: boolean;
}

export default function EmojisList({
  searchQuery,
  onSearchChange,
  onPurchaseSuccess,
  purchasedEmojis,
  showOnlyPurchased = false,
}: EmojisListProps) {
  const [loading, setLoading] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedEmoji = localStorage.getItem(SELECTED_EMOJI_KEY);
    if(storedEmoji) {
        setSelectedEmoji(storedEmoji);
    }
  }, []);
  
  const handleApplyEmoji = (emoji: string) => {
    localStorage.setItem(SELECTED_EMOJI_KEY, emoji);
    setSelectedEmoji(emoji);
    window.dispatchEvent(new Event('storage'));
  }

  const handlePurchase = (emoji: Emoji) => {
    const currentPurchased = JSON.parse(localStorage.getItem(PURCHASED_EMOJIS_KEY) || '[]');
    if (!currentPurchased.includes(emoji.id)) {
        const newPurchased = [...currentPurchased, emoji.id];
        localStorage.setItem(PURCHASED_EMOJIS_KEY, JSON.stringify(newPurchased));
        toast({
            title: "Emoji Purchased!",
            description: `${emoji.name} emoji has been added to your collection.`,
        });
        onPurchaseSuccess();
    } else {
         toast({
            title: "Already Owned",
            description: `You already own the ${emoji.name} emoji.`,
        });
    }
  };

  const filteredEmojis = useMemo(() => {
    let sourceEmojis = staticEmojis;
    if (showOnlyPurchased) {
        sourceEmojis = staticEmojis.filter(c => purchasedEmojis.includes(c.id));
    }
      
    return sourceEmojis.filter(emoji => {
        const query = searchQuery.toLowerCase();
        return emoji.name.toLowerCase().includes(query);
    });
  }, [searchQuery, showOnlyPurchased, purchasedEmojis]);

  return (
    <div className="relative">
      <Card className="bg-transparent shadow-none border-none">
        <CardContent className="p-0">
          {loading && <LoadingSkeleton />}
          {!loading && filteredEmojis.length === 0 && (
              <p className="text-muted-foreground text-center p-4">
                {showOnlyPurchased ? "You haven't purchased any emojis yet." : "No results found."}
              </p>
          )}
          {filteredEmojis.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
                {filteredEmojis.map(emoji => (
                    <EmojiGridItem
                        key={emoji.id}
                        emoji={emoji}
                        onPurchase={handlePurchase}
                        isPurchasedView={showOnlyPurchased}
                        isSelected={selectedEmoji === emoji.emoji}
                        onApply={handleApplyEmoji}
                    />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
