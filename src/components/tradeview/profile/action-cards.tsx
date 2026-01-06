
"use client"

import { Card } from '@/components/ui/card';
import { Gem, Gift, Target } from 'lucide-react';
import type { ReactNode } from 'react';

type ActionCardProps = {
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
};

function ActionCard({ icon, title, subtitle }: ActionCardProps) {
  return (
    <Card className="rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-sm">
      {icon}
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </Card>
  );
}

export default function ActionCards() {
  return (
    <div className="grid grid-cols-1 gap-4">
      
    </div>
  );
}
