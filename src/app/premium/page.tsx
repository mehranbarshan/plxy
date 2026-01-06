
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Gem, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const plans = {
    features: [
        { name: 'Channel Analyses', free: '3', starter: '20', pro: 'Unlimited' },
        { name: 'Signal History', free: 'Last 3', starter: '30 days', pro: 'Full' },
        { name: 'Basic Accuracy Score', free: true, starter: false, pro: false },
        { name: 'AI Score + Risk', free: false, starter: true, pro: true },
        { name: 'Weekly Reports', free: false, starter: true, pro: true },
        { name: 'Support', free: 'Basic', starter: 'Normal', pro: 'Priority' },
        { name: 'No Ads', free: false, starter: true, pro: true },
        { name: 'Fake Signal Detection', free: false, starter: false, pro: true },
        { name: 'Channel Comparison', free: false, starter: false, pro: true },
        { name: 'Whale Alerts', free: false, starter: false, pro: true },
        { name: 'AI Deep Analysis', free: false, starter: false, pro: true },
    ],
};

const FeatureValue = ({ value }: { value: string | boolean | number }) => {
    if (typeof value === 'boolean') {
        return value 
            ? <Check className="w-5 h-5 text-blue-500" />
            : <Minus className="w-5 h-5 text-muted-foreground" />;
    }
    const isHighlighted = ['Unlimited', 'Full', 'Priority'].includes(value as string);
    return <span className={cn("font-medium text-[8px] sm:text-sm", isHighlighted ? "font-bold text-primary" : "")}>{value}</span>;
};


export default function PremiumPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <header className="sticky top-0 z-10 p-3 flex items-center gap-2 container mx-auto max-w-5xl bg-background/80 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-bold">Go Premium</h1>
            </header>

            <main className="flex-grow container mx-auto max-w-5xl px-4 pb-12 flex flex-col items-center">
                <div className="text-center my-8">
                    <Gem className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-xl sm:text-3xl font-bold">Smarter Crypto Channel Analysis</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">See which signals are real. Unlock advanced AI scoring, deep analysis, whale alerts and full history.</p>
                </div>

                <div className="w-full border rounded-2xl overflow-hidden">
                    {/* Headers */}
                    <div className="grid grid-cols-4 bg-secondary/30">
                        <div className="p-4 flex items-center"><p className="font-semibold text-[9px] sm:text-[15px]">Features</p></div>
                        <div className="p-4 text-center">
                            <h3 className="font-bold text-[11px] sm:text-lg text-muted-foreground">Free</h3>
                        </div>
                        <div className="p-4 text-center">
                            <h3 className="font-bold text-[11px] sm:text-lg">Starter</h3>
                        </div>
                        <div className="p-4 text-center bg-primary/10 rounded-t-lg">
                             <h3 className="font-bold text-[11px] sm:text-lg text-primary flex items-center justify-center gap-2">
                                Pro
                            </h3>
                        </div>
                    </div>

                    {/* Price Row */}
                    <div className="grid grid-cols-4 items-center border-t">
                        <div className="p-2 sm:p-4 flex items-center"><p className="font-semibold text-[9px] sm:text-[15px]">Price</p></div>
                        <div className="p-4 text-center">
                            <p className="font-bold text-[13px] sm:text-[22px] text-muted-foreground/80">$0</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="font-bold text-[13px] sm:text-[22px]">$3.99<span className="text-[8px] sm:text-sm text-muted-foreground">/mo</span></p>
                        </div>
                        <div className="p-4 text-center bg-primary/10">
                            <p className="font-bold text-[13px] sm:text-[22px] text-primary">$5.99<span className="text-[8px] sm:text-sm">/mo</span></p>
                        </div>
                    </div>

                    {/* Features Rows */}
                    {plans.features.map((feature, index) => (
                        <div key={feature.name} className="grid grid-cols-4 items-center border-t">
                            <div className="p-2 sm:p-4 h-full flex items-center">
                                <p className={cn("text-[9px] sm:text-[15px]", feature.name === 'AI Deep Analysis' || feature.name === 'Whale Alerts' || feature.name === 'Fake Signal Detection' ? 'font-bold' : 'font-medium')}>
                                  {feature.name}
                                </p>
                            </div>
                            <div className="p-4 flex justify-center items-center h-full"><FeatureValue value={feature.free} /></div>
                            <div className="p-4 flex justify-center items-center h-full"><FeatureValue value={feature.starter} /></div>
                            <div className="p-4 flex justify-center items-center h-full bg-primary/10"><FeatureValue value={feature.pro} /></div>
                        </div>
                    ))}

                    {/* Button Row */}
                    <div className="grid grid-cols-4 items-center border-t">
                        <div className="p-4">&nbsp;</div>
                        <div className="p-4 text-center">
                             <Button variant="outline" disabled className="w-full text-[9px] sm:text-sm">Current Plan</Button>
                        </div>
                        <div className="p-4 text-center">
                             <Button variant="outline" className="w-full text-[9px] sm:text-sm">Choose Plan</Button>
                        </div>
                        <div className="p-4 text-center bg-primary/10 rounded-b-lg">
                            <Button className="w-full text-[9px] sm:text-sm" disabled>Coming soon</Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
