
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

export default function WelcomeCard() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const username = 'Trader';

  const toggleVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  return (
    <Card className="w-full bg-gradient-to-br from-primary to-purple-500 text-primary-foreground rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold leading-tight">Welcome Back, {username}!</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">Track your crypto investments</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <p className="text-sm text-primary-foreground/80">Total Balance</p>
              <Button variant="ghost" size="icon" className="w-6 h-6 text-primary-foreground/80 hover:text-primary-foreground" onClick={toggleVisibility}>
                {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-2xl font-bold">{balanceVisible ? '$124,567.89' : '********'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
