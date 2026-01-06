
"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ChevronLeft, ChevronRight, Trophy, MapPin } from 'lucide-react';
import Link from 'next/link';
import BadgePreview from '@/components/tradeview/club/badge-preview';
import { clubs as staticClubs, type Club } from '@/lib/club-data';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/capitals';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';


const CLUBS_KEY = 'tradeview_clubs';
const USERNAME_KEY = 'tradeview_username';

const OptionSelector = ({ label, options, selected, onSelect, icon }: { label: string, options: string[], selected: string, onSelect: (value: string) => void, icon?: React.ReactNode }) => {
  const currentIndex = options.indexOf(selected);

  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + options.length) % options.length;
    onSelect(options[newIndex]);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % options.length;
    onSelect(options[newIndex]);
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={handlePrev}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-grow h-10 flex items-center justify-center bg-secondary rounded-md text-sm font-semibold gap-2">
          {icon}
          {selected}
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={handleNext}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}


export default function EditClubPage() {
    const router = useRouter();
    const params = useParams();
    const clubId = params.id as string;
    const { toast } = useToast();

    const [club, setClub] = useState<Club | null>(null);
    const [clubName, setClubName] = useState('');
    const [description, setDescription] = useState('');
    const [clubType, setClubType] = useState<Club['type']>('open');
    const [minTrophies, setMinTrophies] = useState("0");
    const [location, setLocation] = useState<string | undefined>();
    const [badge, setBadge] = useState({ icon: 'btc', iconContent: '₿', bgColor: '#f97316', borderColor: 'default' });

    useEffect(() => {
        const storedClubs = localStorage.getItem(CLUBS_KEY);
        const currentClubs: Club[] = storedClubs ? JSON.parse(storedClubs) : staticClubs;
        const clubToEdit = currentClubs.find(c => c.id === clubId);

        if (clubToEdit) {
            setClub(clubToEdit);
            setClubName(clubToEdit.name);
            setDescription(clubToEdit.description);
            setClubType(clubToEdit.type);
            setMinTrophies(clubToEdit.requiredTrophies.toString());
            setLocation(clubToEdit.location || 'International');
            setBadge(clubToEdit.badge);
        } else {
            toast({ variant: 'destructive', title: 'Club not found' });
            router.push('/club');
        }

        const savedBadge = localStorage.getItem('tradeview_badge_draft');
        if (savedBadge) {
            try {
                const parsedBadge = JSON.parse(savedBadge);
                setBadge(parsedBadge);
            } catch (e) { console.error("Failed to parse badge draft", e); }
        }

    }, [clubId, router, toast]);

    const handleSaveChanges = () => {
        if (!club) return;
        if (!clubName.trim()) {
            toast({ variant: 'destructive', title: 'Club Name Required', description: 'Please enter a name for your club.' });
            return;
        }

        const storedClubs = localStorage.getItem(CLUBS_KEY);
        const currentClubs: Club[] = storedClubs ? JSON.parse(storedClubs) : staticClubs;

        const updatedClubs = currentClubs.map(c => {
            if (c.id === clubId) {
                return {
                    ...c,
                    name: clubName,
                    description: description,
                    type: clubType,
                    requiredTrophies: parseInt(minTrophies),
                    badge: badge,
                    location: location,
                };
            }
            return c;
        });

        localStorage.setItem(CLUBS_KEY, JSON.stringify(updatedClubs));
        localStorage.removeItem('tradeview_badge_draft'); // Clean up draft

        toast({ title: "Club Updated", description: "Your club settings have been saved." });
        router.push(`/club/${clubId}`);
    };

    if (!club) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-background/80 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-bold">Edit Club</h1>
            </header>

            <main className="flex-grow container mx-auto max-w-2xl p-4 pt-0 pb-4 space-y-6">
                <Card className="rounded-2xl">
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-grow space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="clubName" className="text-xs">Club Name:</Label>
                                    <Input id="clubName" value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Enter club name..." />
                                </div>
                                <div className="space-y-1 relative">
                                    <Label htmlFor="description" className="text-xs">Description:</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe your club..."
                                        maxLength={150}
                                        className="pr-20"
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                                        {description.length}/150
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1 text-center flex flex-col items-center shrink-0">
                                <Label className="text-xs">Badge:</Label>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-2 bg-secondary rounded-lg border-2 border-dashed w-24 h-24 flex items-center justify-center">
                                        <BadgePreview icon={badge.icon} iconContent={badge.iconContent} bgColor={badge.bgColor} borderColor={badge.borderColor} size={80} />
                                    </div>
                                    <Link href="/club/badge">
                                        <Button variant="outline" size="sm">Edit Badge</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <OptionSelector
                                label="Club Type:"
                                options={["open", "invite", "closed"]}
                                selected={clubType}
                                onSelect={(value) => setClubType(value as Club['type'])}
                            />
                             <OptionSelector 
                                label="Minimum trophies to join:"
                                options={["0", "1000", "2000", "3000", "4000", "5000"]}
                                selected={minTrophies}
                                onSelect={setMinTrophies}
                                icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <Label htmlFor="location" className="text-xs text-muted-foreground">Club Location:</Label>
                            <Select value={location} onValueChange={setLocation}>
                                <SelectTrigger id="location" className="w-full h-10">
                                     <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <SelectValue placeholder="Browse" />
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
                        
                        <Button className="w-full h-12 text-lg font-bold" onClick={handleSaveChanges}>Save Changes</Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
