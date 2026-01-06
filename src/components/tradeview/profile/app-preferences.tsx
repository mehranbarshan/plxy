
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';

export default function AppPreferences() {
  return (
    <Card className="rounded-2xl mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Smartphone className="w-5 h-5 text-muted-foreground" />
          App Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
          <span className="font-medium text-sm">Currency</span>
          <span className="text-sm text-muted-foreground">USD</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
          <span className="font-medium text-sm">Theme</span>
          <span className="text-sm text-muted-foreground">Light</span>
        </div>
      </CardContent>
    </Card>
  )
}
