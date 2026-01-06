
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { frames as staticFrames, type Frame } from '@/lib/frame-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Circle } from 'lucide-react';

const PURCHASED_FRAMES_KEY = 'tradeview_purchased_frames';
const SELECTED_FRAME_COLOR_KEY = 'tradeview_selected_frame_color';

const FrameGridItem = ({ frame, onPurchase, isPurchasedView, isSelected, onApply }: { frame: Frame; onPurchase: (frame: Frame) => void; isPurchasedView: boolean; isSelected: boolean; onApply: (color: string) => void; }) => {
  const [purchaseState, setPurchaseState] = useState<'purchase' | 'applying' | 'continue'>('purchase');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handlePurchaseClick = () => {
    onPurchase(frame);
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
    onApply(frame.color);
    toast({
        title: "Frame Applied!",
        description: "Your new frame is now active on your profile."
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
      return `$${frame.price.toLocaleString()}`;
  }

  const cardContent = (
     <Card className={cn("relative rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-secondary transition-colors aspect-square", isSelected && isPurchasedView ? 'border-green-500' : '')}>
        <div className="w-16 h-16 relative flex items-center justify-center">
          <Circle className="w-full h-full" style={{ color: frame.color }} strokeWidth={2.4} />
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
          <div className="w-24 h-24 relative mx-auto mb-4 flex items-center justify-center">
             <Circle className="w-full h-full" style={{ color: frame.color }} strokeWidth={2.4} />
          </div>
          <DialogTitle className="text-center">{frame.name}</DialogTitle>
           
        </DialogHeader>
        <div className="py-2 text-center">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-2xl font-bold">${frame.price.toLocaleString()}</p>
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

interface FramesListProps {
    searchQuery: string;
    onSearchChange?: (query: string) => void;
    onPurchaseSuccess: () => void;
    purchasedFrames: string[];
    showOnlyPurchased?: boolean;
}

export default function FramesList({
  searchQuery,
  onSearchChange,
  onPurchaseSuccess,
  purchasedFrames,
  showOnlyPurchased = false,
}: FramesListProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFrameColor, setSelectedFrameColor] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedFrameColor = localStorage.getItem(SELECTED_FRAME_COLOR_KEY);
    if(storedFrameColor) {
        setSelectedFrameColor(storedFrameColor);
    }
  }, []);
  
  const handleApplyFrame = (color: string) => {
    localStorage.setItem(SELECTED_FRAME_COLOR_KEY, color);
    setSelectedFrameColor(color);
    window.dispatchEvent(new Event('storage'));
  }

  const handlePurchase = (frame: Frame) => {
    const currentPurchased = JSON.parse(localStorage.getItem(PURCHASED_FRAMES_KEY) || '[]');
    if (!currentPurchased.includes(frame.id)) {
        const newPurchased = [...currentPurchased, frame.id];
        localStorage.setItem(PURCHASED_FRAMES_KEY, JSON.stringify(newPurchased));
        toast({
            title: "Frame Purchased!",
            description: `${frame.name} frame has been added to your collection.`,
        });
        onPurchaseSuccess();
    } else {
         toast({
            title: "Already Owned",
            description: `You already own the ${frame.name} frame.`,
        });
    }
  };

  const filteredFrames = useMemo(() => {
    let sourceFrames = staticFrames;
    if (showOnlyPurchased) {
        sourceFrames = staticFrames.filter(c => purchasedFrames.includes(c.id));
    }
      
    return sourceFrames.filter(frame => {
        const query = searchQuery.toLowerCase();
        return frame.name.toLowerCase().includes(query);
    });
  }, [searchQuery, showOnlyPurchased, purchasedFrames]);

  return (
    <div className="relative">
      <Card className="bg-transparent shadow-none border-none">
        <CardContent className="p-0">
          {loading && <LoadingSkeleton />}
          {!loading && filteredFrames.length === 0 && (
              <p className="text-muted-foreground text-center p-4">
                {showOnlyPurchased ? "You haven't purchased any frames yet." : "No results found."}
              </p>
          )}
          {filteredFrames.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
                {filteredFrames.map(frame => (
                    <FrameGridItem
                        key={frame.id}
                        frame={frame}
                        onPurchase={handlePurchase}
                        isPurchasedView={showOnlyPurchased}
                        isSelected={selectedFrameColor === frame.color}
                        onApply={handleApplyFrame}
                    />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
