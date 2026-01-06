
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { avatars as staticAvatars, type AvatarData } from '@/lib/avatar-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';

const PURCHASED_AVATARS_KEY = 'tradeview_purchased_avatars';
const SELECTED_AVATAR_KEY = 'tradeview_avatar';

const AvatarGridItem = ({ avatar, onPurchase, isPurchasedView, isSelected, onApply }: { avatar: AvatarData; onPurchase: (avatar: AvatarData) => void; isPurchasedView: boolean; isSelected: boolean; onApply: (avatarUrl: string) => void; }) => {
  const [purchaseState, setPurchaseState] = useState<'purchase' | 'applying' | 'continue'>('purchase');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handlePurchaseClick = () => {
    onPurchase(avatar);
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
    onApply(avatar.image);
    toast({
        title: "Avatar Applied!",
        description: "Your new avatar is now active on your profile."
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
      return `$${avatar.price.toLocaleString()}`;
  }

  const cardContent = (
     <Card className={cn("relative rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-secondary transition-colors aspect-square", isSelected && isPurchasedView ? 'border-green-500' : '')}>
        <div className="w-16 h-16 relative">
          <Image src={avatar.image} alt={avatar.name} layout="fill" objectFit="cover" className="rounded-full border-2 border-border" />
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
             <Image src={avatar.image} alt={avatar.name} layout="fill" objectFit="cover" className="rounded-full border-4 border-border" />
          </div>
          <DialogTitle className="text-center">{avatar.name}</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-center">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-2xl font-bold">${avatar.price.toLocaleString()}</p>
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

interface AvatarsListProps {
    searchQuery: string;
    onSearchChange?: (query: string) => void;
    onPurchaseSuccess: () => void;
    purchasedAvatars: string[];
    showOnlyPurchased?: boolean;
}

export default function AvatarsList({
  searchQuery,
  onSearchChange,
  onPurchaseSuccess,
  purchasedAvatars,
  showOnlyPurchased = false,
}: AvatarsListProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedAvatar = localStorage.getItem(SELECTED_AVATAR_KEY);
    if(storedAvatar) {
        setSelectedAvatar(storedAvatar);
    }
  }, []);
  
  const handleApplyAvatar = (avatarUrl: string) => {
    localStorage.setItem(SELECTED_AVATAR_KEY, avatarUrl);
    setSelectedAvatar(avatarUrl);
    window.dispatchEvent(new Event('storage'));
  }

  const handlePurchase = (avatar: AvatarData) => {
    const currentPurchased = JSON.parse(localStorage.getItem(PURCHASED_AVATARS_KEY) || '[]');
    if (!currentPurchased.includes(avatar.id)) {
        const newPurchased = [...currentPurchased, avatar.id];
        localStorage.setItem(PURCHASED_AVATARS_KEY, JSON.stringify(newPurchased));
        toast({
            title: "Avatar Purchased!",
            description: `${avatar.name} has been added to your collection.`,
        });
        onPurchaseSuccess();
    } else {
         toast({
            title: "Already Owned",
            description: `You already own the ${avatar.name} avatar.`,
        });
    }
  };

  const filteredAvatars = useMemo(() => {
    let sourceAvatars = staticAvatars;
    if (showOnlyPurchased) {
        sourceAvatars = staticAvatars.filter(c => purchasedAvatars.includes(c.id));
    }
      
    return sourceAvatars.filter(avatar => {
        const query = searchQuery.toLowerCase();
        return avatar.name.toLowerCase().includes(query);
    });
  }, [searchQuery, showOnlyPurchased, purchasedAvatars]);

  return (
    <div className="relative">
      <Card className="bg-transparent shadow-none border-none">
        <CardContent className="p-0">
          {loading && <LoadingSkeleton />}
          {!loading && filteredAvatars.length === 0 && (
              <p className="text-muted-foreground text-center p-4">
                {showOnlyPurchased ? "You haven't purchased any avatars yet." : "No results found."}
              </p>
          )}
          {filteredAvatars.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
                {filteredAvatars.map(avatar => (
                    <AvatarGridItem
                        key={avatar.id}
                        avatar={avatar}
                        onPurchase={handlePurchase}
                        isPurchasedView={showOnlyPurchased}
                        isSelected={selectedAvatar === avatar.image}
                        onApply={handleApplyAvatar}
                    />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
