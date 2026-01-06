
"use client"

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, ArrowLeft } from 'lucide-react';

function NotificationSettingsContent() {
  return (
    <Card className="rounded-2xl mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="w-5 h-5 text-muted-foreground" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="push-notifications" className="font-medium text-sm">Push Notifications</Label>
            <p className="text-xs text-muted-foreground">Receive trading alerts and updates</p>
          </div>
          <Switch id="push-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="email-updates" className="font-medium text-sm">Email Updates</Label>
            <p className="text-xs text-muted-foreground">Weekly performance reports</p>
          </div>
          <Switch id="email-updates" defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="sms-alerts" className="font-medium text-sm">SMS Alerts</Label>
            <p className="text-xs text-muted-foreground">Critical signal notifications</p>
          </div>
          <Switch id="sms-alerts" />
        </div>
      </CardContent>
    </Card>
  );
}


export default function NotificationsPage() {
    const router = useRouter();
    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className="sticky top-0 z-10 p-3 flex items-center gap-2 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-bold">Notifications</h1>
            </header>
            <main className="flex-grow container mx-auto max-w-2xl px-4 pb-4">
                <NotificationSettingsContent />
            </main>
        </div>
    );
}

