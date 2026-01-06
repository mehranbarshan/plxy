

'use client';

import {
  ArrowLeft,
  Bell,
  Camera,
  Folder,
  Globe,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Lock,
  MessageSquare,
  Palette,
  Power,
  Search,
  Settings,
  Shield,
  Smile,
  Sticker,
  User as UserIcon,
  MoreVertical,
  LogOut,
  Loader2,
  Edit,
  Trash2,
  AtSign,
  Crown,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { moderateImage } from '@/ai/flows/image-moderation';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const USERNAME_KEY = 'tradeview_username';
const USER_EMAIL_KEY = 'tradeview_user_email';
const AVATAR_KEY = 'tradeview_avatar';
const TABS_ORDER_KEY = 'tradeview_tabs_order';

const InfoRow = ({
  label,
  value,
  subtext,
  icon,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon?: React.ReactNode;
}) => {
    const { language } = useTranslation();
    return (
        <div className={cn("flex items-start p-4", language === 'fa' ? 'flex-row-reverse text-right' : 'gap-4')}>
            {icon && <div className={cn("text-muted-foreground mt-1", language === 'fa' ? 'ml-4' : '')}>{icon}</div>}
            <div className="flex-grow">
            <p className="text-sm">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
            </div>
        </div>
    )
};

const SettingsItem = ({
  label,
  icon,
  onClick,
  isLanguageSelector = false,
  href,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void,
  isLanguageSelector?: boolean;
  href?: string;
  className?: string;
}) => {
  const { language, setLanguage } = useTranslation();

  const content = (
    <div className={cn("flex items-center p-4 hover:bg-secondary cursor-pointer", language === 'fa' ? 'flex-row-reverse justify-end text-right gap-4' : 'gap-4', className)}>
      <div className={cn("text-muted-foreground")}>{icon}</div>
      <span className="text-sm flex-grow">{label}</span>
      {isLanguageSelector && (
        <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fa')}>
          <SelectTrigger className={cn("w-auto bg-secondary border-none text-xs h-8 px-2 text-foreground", language === 'fa' && "rtl-text")}>
              <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fa">فارسی</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
  
  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
};

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useTranslation();
  const [showHeaderInfo, setShowHeaderInfo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowHeaderInfo(true);
      } else {
        setShowHeaderInfo(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    const storedUsername = localStorage.getItem(USERNAME_KEY);
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
    const storedAvatar = localStorage.getItem(AVATAR_KEY);
    
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
        setUsername('User #771914308');
    }
    
    if (storedEmail) {
        setUserEmail(storedEmail);
    } else {
        setUserEmail('user_#771914308@plxy.com');
    }

    if (storedAvatar) {
        setAvatarUrl(storedAvatar);
    } else {
        setAvatarUrl('https://picsum.photos/seed/user/200');
    }
    setIsLoading(false);
  }, []);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
            variant: 'destructive',
            title: 'Image Too Large',
            description: 'Please select an image smaller than 4MB.',
        });
        return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
        const dataUrl = reader.result as string;

        try {
            const moderationResult = await moderateImage({ photoDataUri: dataUrl });
            if (!moderationResult.isSafe) {
                toast({
                    variant: 'destructive',
                    title: 'Inappropriate Image',
                    description: moderationResult.reason || 'Please select a different image.',
                });
                setIsUploading(false);
                return;
            }
            
            setAvatarUrl(dataUrl);
            localStorage.setItem(AVATAR_KEY, dataUrl);
            window.dispatchEvent(new Event('storage'));
            toast({
                title: 'Avatar Updated',
                description: 'Your new avatar has been set.',
            });

        } catch (error) {
            console.error("Image moderation error:", error);
            toast({
                variant: 'destructive',
                title: 'Error Analyzing Image',
                description: 'Could not analyze the image. Please try again.',
            });
        } finally {
            setIsUploading(false);
        }
    };
    reader.readAsDataURL(file);
  };

  const handleFeatureClick = (featureName: string) => {
    toast({
      title: 'Not Implemented',
      description: `The "${'\'\''}${featureName}" feature is for demonstration purposes.`,
    });
  };
  
  const handleDeleteAccount = () => {
      // In a real app, this would involve API calls and data cleanup.
      // For demo purposes, we'll just clear localStorage.
      localStorage.clear();
      toast({
          title: "Account Deleted",
          description: "Your account and all associated data have been removed."
      });
      router.push('/signup');
  };


  const handleLogout = async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('tradeview_username');
        localStorage.removeItem('tradeview_avatar');
        localStorage.removeItem('tradeview_user_email');
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out."
        });
        router.push('/login');
    } catch (error) {
        toast({
          variant: 'destructive',
          title: "Logout Failed",
          description: "Could not log out. Please try again."
        });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className={cn("sticky top-0 z-10 flex items-center justify-between p-2 bg-blue-500 dark:bg-secondary", language === 'fa' ? 'flex-row-reverse' : '')}>
        <div className={cn("flex items-center", language === 'fa' ? 'flex-row-reverse' : '')}>
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white dark:text-muted-foreground hover:bg-transparent dark:hover:bg-transparent hover:text-white dark:hover:text-foreground">
              <ArrowLeft className={cn("h-6 w-6", language === 'fa' ? 'rotate-180' : '')} />
            </Button>
            <AnimatePresence>
              {showHeaderInfo && (
                <motion.div
                  className={cn("flex flex-col items-start", language === 'fa' ? 'items-end' : '')}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-lg font-bold text-white dark:text-secondary-foreground">{username}</h2>
                  <p className="text-xs text-blue-300 dark:text-blue-300">{t('profile_page.online_status')}</p>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
        
        <div className={cn("flex items-center", language === 'fa' ? 'flex-row-reverse' : 'gap-2')}>
          <Button variant="ghost" size="icon" onClick={() => handleFeatureClick('Search')} className="text-white dark:text-muted-foreground hover:bg-transparent dark:hover:bg-transparent hover:text-white dark:hover:text-foreground">
            <Search className="h-6 w-6" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white dark:text-muted-foreground hover:bg-transparent dark:hover:bg-transparent hover:text-white dark:hover:text-foreground">
                <MoreVertical className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Edit className="mr-2 h-4 w-4" />
                <span>{t('profile_page.edit_info')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCameraClick}>
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>{t('profile_page.set_profile_picture')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('profile_page.log_out')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="pb-8">
        <div className="bg-blue-500 dark:bg-secondary text-white dark:text-secondary-foreground p-4 pt-0">
        {isLoading ? (
            <>
              <div className="relative mx-auto h-24 w-24">
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
              <div className="mt-4 text-center">
                <Skeleton className="h-8 w-32 mx-auto" />
                <Skeleton className="h-5 w-20 mx-auto mt-2" />
              </div>
            </>
          ) : (
            <>
              <div className="relative mx-auto h-24 w-24">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
              </div>
              <div className="mt-4 text-center">
                <h1 className="text-2xl font-bold">{username}</h1>
                <p className="text-sm text-blue-300 dark:text-blue-300">{t('profile_page.online_status')}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <h2 className={cn("px-4 pb-2 text-primary font-semibold", language === 'fa' && 'text-right')}>{t('profile_page.account_title')}</h2>
          <div className="bg-card">
            <InfoRow
              label={t('profile_page.email_label')}
              value={userEmail}
              icon={<AtSign className="h-6 w-6" />}
            />
            <Separator />
            <InfoRow
              label={t('profile_page.current_plan')}
              value={t('profile_page.free_plan')}
              icon={<Crown className="h-6 w-6" />}
            />
            <Separator />
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <div className={cn("flex items-center p-4 hover:bg-secondary cursor-pointer", language === 'fa' ? 'flex-row-reverse text-right' : 'gap-4')}>
                        <div className={cn("text-muted-foreground", language === 'fa' && 'ml-4')}><Trash2 className="h-6 w-6" /></div>
                        <div className="flex-grow">
                             <span className="text-sm">{t('profile_page.delete_account')}</span>
                        </div>
                    </div>
                </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Yes, Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="mt-8 space-y-2">
          <h2 className={cn("px-4 pb-2 text-primary font-semibold", language === 'fa' && 'text-right')}>{t('profile_page.settings_title')}</h2>
          <div className="bg-card">
            <SettingsItem href="/notifications" label={t('profile_page.notifications')} icon={<Bell className="h-6 w-6" />} />
            <Separator />
            <SettingsItem href="/settings" label={t('profile_page.privacy_security')} icon={<Lock className="h-6 w-6" />} />
            <Separator />
            <SettingsItem href="/your-channels" label={t('settings.collections')} icon={<Folder className="h-6 w-6" />} />
            <Separator />
            <SettingsItem href="/folders" label={t('settings.folders')} icon={<Folder className="h-6 w-6" />} />
            <Separator />
            <SettingsItem href="#" label={t('settings.language')} icon={<Globe className="h-6 w-6" />} isLanguageSelector={true} />
          </div>
        </div>
        
        <div className="mt-8 space-y-2">
          <h2 className={cn("px-4 pb-2 text-primary font-semibold", language === 'fa' && 'text-right')}>{t('profile_page.help_title')}</h2>
           <div className="bg-card">
            <SettingsItem href="/settings" label={t('settings.ask_question')} icon={<HelpCircle className="h-6 w-6" />} />
            <Separator />
            <SettingsItem href="/settings" label={t('settings.faq')} icon={<HelpCircle className="h-6 w-6" />} />
            <Separator />
            <SettingsItem href="/settings" label={t('settings.privacy_policy')} icon={<Shield className="h-6 w-6" />} />
          </div>
        </div>

      </main>
    </div>
  );
}
