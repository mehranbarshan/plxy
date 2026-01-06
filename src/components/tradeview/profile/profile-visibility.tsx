
"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Eye, Info, User, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/capitals';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';

const PROFILE_VISIBILITY_KEY = 'tradeview_profile_visibility';
const USERNAME_KEY = 'tradeview_username';

interface ProfileSettings {
    username: string;
    location: string;
    specialties: string;
    winRateVisible: boolean;
    pnlVisible: boolean;
    aumVisible: boolean;
}

export default function ProfileVisibility() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ProfileSettings>({
      username: '',
      location: 'International',
      specialties: 'DeFi, Layer 1, Gaming',
      winRateVisible: true,
      pnlVisible: true,
      aumVisible: false,
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem(USERNAME_KEY);
    const storedSettings = localStorage.getItem(PROFILE_VISIBILITY_KEY);

    if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
    } else if(storedUsername) {
        // If no settings, but user exists, populate with default username
        setSettings(prev => ({...prev, username: storedUsername}));
    }
  }, []);
  
  const handleInputChange = (field: keyof ProfileSettings, value: string | boolean) => {
      setSettings(prev => ({...prev, [field]: value}));
  }

  const handleUpdate = () => {
    localStorage.setItem(PROFILE_VISIBILITY_KEY, JSON.stringify(settings));
    toast({
      title: "Profile Updated",
      description: "Your visibility settings have been saved.",
    });
  };

  return (
    <Card className="rounded-2xl mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="w-5 h-5 text-muted-foreground" />
          Public Profile
        </CardTitle>
        <CardDescription className="text-xs">
          Manage the information shown to other users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-sm">Display Name</Label>
          <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <User className="w-4 h-4" />
             </div>
             <Input id="nickname" type="text" value={settings.username} onChange={(e) => handleInputChange('username', e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="location" className="text-sm">Location</Label>
            <Select value={settings.location} onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger id="location" className="w-full">
                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Select a country" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <ScrollArea className="h-72">
                        {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                                {country}
                            </SelectItem>
                        ))}
                    </ScrollArea>
                </SelectContent>
            </Select>
        </div>
         <div className="space-y-2">
          <Label htmlFor="specialties" className="text-sm">Specialties (comma-separated)</Label>
          <Input id="specialties" type="text" value={settings.specialties} onChange={(e) => handleInputChange('specialties', e.target.value)} />
        </div>
        
        <div className="space-y-2 pt-4 border-t">
            <Label className="font-semibold text-sm">Stats Visibility</Label>
             <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="win-rate-visible" className="font-medium text-sm">Win Rate</Label>
              </div>
              <Switch id="win-rate-visible" checked={settings.winRateVisible} onCheckedChange={(checked) => handleInputChange('winRateVisible', checked)} />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="pnl-visible" className="font-medium text-sm">Total P&L</Label>
              </div>
              <Switch id="pnl-visible" checked={settings.pnlVisible} onCheckedChange={(checked) => handleInputChange('pnlVisible', checked)} />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="aum-visible" className="font-medium text-sm">Assets Under Management</Label>
              </div>
              <Switch id="aum-visible" checked={settings.aumVisible} onCheckedChange={(checked) => handleInputChange('aumVisible', checked)} />
            </div>
        </div>

        <Button className="w-full" onClick={handleUpdate}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
