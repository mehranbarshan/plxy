

"use client"

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, User, Bell, ChevronRight, Send, HelpCircle, FileText, Star, Globe, Gift, Share2, Info, Sun, Moon, LayoutGrid, Settings, UserCog, LogOut, Folder, TrendingUp, Newspaper, Droplets, Search as SearchIcon, BookOpen, HandCoins, HeartPulse, Music, Palette, Group, Briefcase, BrainCircuit, Bot, ChevronsUpDown, Trash2, PlusCircle, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { Separator } from '../ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const SettingsItem = ({ icon, label, subtext, onClick, isLanguageSelector = false, href }: { icon: React.ReactNode; label:string; subtext?: string; onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void, isLanguageSelector?: boolean, href?: string }) => {
    const { language, setLanguage } = useTranslation();
    
    const content = (
        <div className="flex items-center justify-between p-4 rounded-none hover:bg-secondary">
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground">
              {icon}
            </div>
            <div>
              <p className="font-semibold text-base text-foreground">{label}</p>
            </div>
          </div>
          {isLanguageSelector ? (
             <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fa')}>
                <SelectTrigger 
                  className="w-auto bg-secondary border-none text-xs h-8 px-2 text-foreground"
                  onClick={(e) => e.stopPropagation()} // Stop propagation here
                >
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fa">فارسی</SelectItem>
                </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2">
                {subtext && <p className="text-sm text-muted-foreground">{subtext}</p>}
            </div>
          )}
        </div>
      );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="w-full text-left cursor-pointer border-b block">
                {content}
            </a>
        )
    }

    return (
        <div onClick={onClick} className="w-full text-left cursor-pointer">
            {content}
        </div>
    )
};

interface SettingsSheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const generateColorFromUsername = (username: string) => {
    if (!username) return 'hsl(0, 0%, 80%)';
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 30%)`;
};


export default function SettingsSheet({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: SettingsSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState('User');
  const [avatar, setAvatar] = useState('https://asset.gaminvest.org/asset/social-trading/profile.png');
  const { t, language } = useTranslation();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;


  useEffect(() => {
    const storedUsername = localStorage.getItem('tradeview_username');
    const storedAvatar = localStorage.getItem('tradeview_avatar');
    if (storedUsername) setUsername(storedUsername);
    if (storedAvatar) setAvatar(storedAvatar);

    const handleStorageChange = () => {
      const updatedUsername = localStorage.getItem('tradeview_username');
      const updatedAvatar = localStorage.getItem('tradeview_avatar');
      if (updatedUsername) setUsername(updatedUsername);
      if (updatedAvatar) setAvatar(updatedAvatar);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tradeview_username');
    localStorage.removeItem('tradeview_avatar');
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    });
    setOpen(false);
    router.push('/login');
  }

  const handleCategoryClick = (tab: string) => {
      router.push(`/telegram-channels?tab=${tab}`);
      setOpen(false);
  }


  const handleItemClick = (feature: string) => {
    toast({
      title: "Feature not available",
      description: `The "${feature}" feature is for demonstration purposes.`,
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    if (info.offset.x < -100 && info.velocity.x < -20) {
      setOpen(false);
    }
  };
  
    const categories = [
        { name: "News & Media", icon: <Newspaper className="w-6 h-6" /> },
        { name: "Entertainment", icon: <BookOpen className="w-6 h-6" /> },
        { name: "Educational", icon: <BrainCircuit className="w-6 h-6" /> },
        { name: "Business & Shopping", icon: <Briefcase className="w-6 h-6" /> },
        { name: "Finance & Investment", icon: <HandCoins className="w-6 h-6" /> },
        { name: "Science & Technology", icon: <BrainCircuit className="w-6 h-6" /> },
        { name: "Sports", icon: <TrendingUp className="w-6 h-6" /> },
        { name: "Lifestyle & Personal", icon: <HeartPulse className="w-6 h-6" /> },
        { name: "Music & Art", icon: <Music className="w-6 h-6" /> },
        { name: "Tools & Services", icon: <Bot className="w-6 h-6" /> },
        { name: "Community & Groups", icon: <Group className="w-6 h-6" /> },
    ];


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11 hover:bg-transparent dark:hover:bg-transparent">
          <Menu className="h-6 w-6 text-white dark:text-muted-foreground" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      {open && <motion.div className="fixed inset-0 z-40 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />}
      <SheetContent side="left" className="p-0 w-3/4 flex flex-col !bg-transparent !border-none" showOverlay={false}>
         <motion.div
            drag="x"
            onDragEnd={handleDragEnd}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 1, right: 0.05 }}
            className="h-full w-full bg-background flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
         >
        
        <div className="flex-grow overflow-y-auto">
            <SheetHeader className="p-4 text-left bg-blue-500 dark:bg-secondary">
              <SheetTitle className="sr-only">Settings</SheetTitle>
              <div className="flex justify-between items-start">
                <div className="flex flex-col items-start gap-2">
                    <Link href="/profile" onClick={() => setOpen(false)}>
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={avatar} alt={username} />
                            <AvatarFallback className="text-white text-3xl" style={{ backgroundColor: generateColorFromUsername(username) }}>{username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <p className="font-bold text-sm pt-4 text-white dark:text-secondary-foreground">{username}</p>
                </div>
                  <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-white dark:text-secondary-foreground hover:text-white dark:hover:text-secondary-foreground">
                      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </Button>
              </div>
            </SheetHeader>
            <div
              className="relative w-full my-2 flex h-24 items-center overflow-hidden rounded-none bg-blue-500 text-white transition-colors hover:bg-blue-600 cursor-pointer"
              onClick={() => { router.push('/premium'); setOpen(false); }}
            >
              <div className="z-10 pl-4">
                <h2 className="text-base font-bold">{t('settings.get_premium')}</h2>
              </div>
              <div className="absolute right-0 bottom-0 h-24 w-24">
                <Image src="/detective.png" alt="Premium Character" fill style={{ objectFit: 'contain' }} data-ai-hint="detective character" />
              </div>
            </div>
            
            <div className="mt-2 flex-grow p-2 space-y-2">
                <SettingsItem icon={<User className="w-6 h-6" />} label={t('settings.dashboard')} onClick={() => {router.push('/dashboard'); setOpen(false);}} />
                <SettingsItem icon={<Target className="w-6 h-6" />} label={t('settings.my_signals')} onClick={() => {router.push('/my-signals'); setOpen(false);}} />
                <SettingsItem icon={<Folder className="w-6 h-6" />} label={t('settings.collections')} onClick={() => {router.push('/your-channels'); setOpen(false);}} />
                <SettingsItem icon={<Settings className="w-6 h-6" />} label={t('settings.settings_item')} onClick={() => {router.push('/settings'); setOpen(false);}} />
                <Separator className="my-2" />
                <SettingsItem icon={<LayoutGrid className="w-6 h-6" />} label={t('settings.categories')} onClick={() => {router.push('/categories'); setOpen(false);}} />
                <SettingsItem icon={<Gift className="w-6 h-6" />} label={t('settings.invite')} onClick={() => {router.push('/invite'); setOpen(false);}} />
            </div>
        </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
