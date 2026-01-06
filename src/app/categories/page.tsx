
"use client"

import {
  Newspaper,
  BookOpen,
  BrainCircuit,
  Briefcase,
  HandCoins,
  TrendingUp,
  HeartPulse,
  Music,
  Bot,
  Group,
  ArrowLeft,
  Film,
  Play,
  Shield,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const categoriesData = [
    { key: "news_media", icon: <Newspaper className="w-6 h-6" /> },
    { key: "entertainment", icon: <BookOpen className="w-6 h-6" /> },
    { key: "educational", icon: <BrainCircuit className="w-6 h-6" /> },
    { key: "business_shopping", icon: <Briefcase className="w-6 h-6" /> },
    { key: "finance_investment", icon: <HandCoins className="w-6 h-6" /> },
    { key: "science_technology", icon: <BrainCircuit className="w-6 h-6" /> },
    { key: "sports", icon: <TrendingUp className="w-6 h-6" /> },
    { key: "lifestyle_personal", icon: <HeartPulse className="w-6 h-6" /> },
    { key: "music_art", icon: <Music className="w-6 h-6" /> },
    { key: "tools_services", icon: <Bot className="w-6 h-6" /> },
    { key: "community_groups", icon: <Group className="w-6 h-6" /> },
    { key: "movies", icon: <Film className="w-6 h-6" /> },
    { key: "anime", icon: <Play className="w-6 h-6" /> },
    { key: "proxy_vpn", icon: <Shield className="w-6 h-6" /> },
    { key: "other", icon: <MoreHorizontal className="w-6 h-6" /> },
];

const CategoryItem = ({ icon, label }: { icon: React.ReactNode; label: string; }) => {
    const router = useRouter();
    const { language } = useTranslation();
    
    const slug = label.toLowerCase().replace(/ & /g, ' and ').replace(/[\s/]+/g, '-');
    
    return (
        <div 
            onClick={() => {
                router.push(`/categories/${slug}`);
            }}
            className={cn("flex items-center justify-between p-4 rounded-lg hover:bg-secondary cursor-pointer", language === 'fa' && 'flex-row-reverse')}
        >
          <div className={cn("flex items-center gap-4", language === 'fa' && 'flex-row-reverse text-right')}>
            <div className="text-muted-foreground">
              {icon}
            </div>
            <div className={cn(language === 'fa' && 'text-right')}>
              <p className="font-semibold text-base text-foreground">{label}</p>
            </div>
          </div>
        </div>
    )
};

export default function CategoriesPage() {
    const router = useRouter();
    const { t, language } = useTranslation();
    
    const categories = categoriesData.map(category => ({
        ...category,
        name: t(`categories.${category.key}`)
    }));
    
    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className="sticky top-0 z-10 p-4 flex items-center gap-4 container mx-auto max-w-2xl bg-blue-500 text-white">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
                    <ArrowLeft className={cn("w-5 h-5", language === 'fa' && 'rotate-180')} />
                </Button>
                <h1 className="text-lg font-bold">{t('categories_page.title')}</h1>
            </header>
            <main className="flex-grow container mx-auto max-w-2xl px-4 pb-4 pt-2 space-y-2">
                {categories.map((category) => (
                    <CategoryItem 
                        key={category.name} 
                        icon={category.icon} 
                        label={category.name} 
                    />
                ))}
            </main>
        </div>
    )
}
