'use client';

import { ArrowUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function PortfolioBalance() {
  const { toast } = useToast();

  const handleBuyCrypto = () => {
    toast({
      title: 'Action Simulated',
      description: 'The "Buy Crypto" feature is for demonstration purposes.',
    });
  };

  const handleQuickTrade = () => {
    toast({
      title: 'Action Simulated',
      description: 'The "Quick Trade" feature is for demonstration purposes.',
    });
  };

  return (
    <Card className="w-full bg-primary text-primary-foreground rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-primary-foreground/80">Total Balance</p>
            <p className="text-3xl font-bold">$12,485.20</p>
          </div>
          <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
            <ArrowUp className="h-4 w-4" />
            <span>12.5%</span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <Button
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
            onClick={handleBuyCrypto}
          >
            Buy Crypto
          </Button>
          <Button
            variant="secondary"
            className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-xl"
            onClick={handleQuickTrade}
          >
            Quick Trade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
