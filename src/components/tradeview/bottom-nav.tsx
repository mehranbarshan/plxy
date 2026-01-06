

'use client';
import Link from 'next/link';
import { Home, Send, User, LayoutGrid, Trophy, CandlestickChart, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';

const USERNAME_KEY = 'tradeview_username';
const AVATAR_KEY = 'tradeview_avatar';

const generateColorFromUsername = (username: string) => {
    if (!username) return 'hsl(0, 0%, 80%)';
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 30%)`;
};


export default function BottomNav() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [username, setUsername] = useState('U');
  const [avatar, setAvatar] = useState("https://asset.gaminvest.org/asset/social-trading/profile.png");
  
  useEffect(() => {
    const updateUserData = () => {
      const storedUsername = localStorage.getItem(USERNAME_KEY);
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        setUsername('User'); // Default if nothing is stored
      }
      const storedAvatar = localStorage.getItem(AVATAR_KEY);
      if (storedAvatar) {
        setAvatar(storedAvatar);
      } else {
        // Set a default if no avatar is stored
        setAvatar('https://asset.gaminvest.org/asset/social-trading/profile.png');
      }
    };
    
    updateUserData();
    
    window.addEventListener('storage', updateUserData);
    return () => {
      window.removeEventListener('storage', updateUserData);
    };
  }, []);

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home, onClick: undefined },
    { name: 'Channels', href: '/telegram-channels', icon: Send, onClick: undefined },
    { name: 'Demo Trade', href: '/futures', icon: CandlestickChart, onClick: undefined },
    { name: 'Tournament', href: '/leaderboard', icon: Trophy, onClick: undefined },
    { name: 'Profile', href: '/profile', icon: User, onClick: undefined },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[66px] z-50">
      <div className="container mx-auto max-w-2xl h-full px-0">
        <div className="relative flex justify-around items-center h-full bg-card/95 backdrop-blur-sm border-t border-border/60 md:rounded-b-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            
            const content = (
              <div
                className={cn(
                  'flex flex-col items-center justify-center h-12 w-16 rounded-2xl transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                  'hover:text-primary/80'
                )}
                aria-label={item.name}
              >
                {item.name === 'Profile' ? (
                   <Avatar className="w-7 h-7">
                        <AvatarImage src={avatar} alt={username} />
                        <AvatarFallback className="text-white" style={{ backgroundColor: generateColorFromUsername(username) }}>{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                ) : (
                    <item.icon className="h-6 w-6" />
                )}
              </div>
            );

            if (item.onClick) {
                return (
                    <div key={item.name} onClick={item.onClick} className="cursor-pointer">
                        {content}
                    </div>
                );
            }

            return (
              <Link
                href={item.href}
                key={item.name}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
