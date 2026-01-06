
"use client"

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronRight, Lock } from 'lucide-react';

export default function SecuritySettings() {
  return (
    <Card className="rounded-2xl mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="w-5 h-5 text-muted-foreground" />
          Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
          <span className="font-medium text-sm">Change Password</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="biometric-login" className="font-medium text-sm">Biometric Login</Label>
            <p className="text-xs text-muted-foreground">Use fingerprint or face ID</p>
          </div>
          <Switch id="biometric-login" defaultChecked />
        </div>
      </CardContent>
    </Card>
  )
}
