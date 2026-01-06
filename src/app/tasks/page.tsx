
"use client";

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BottomNav from '@/components/tradeview/bottom-nav';
import FuturesHeader from '@/components/tradeview/futures-header';

function DailyTasks() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Tasks</CardTitle>
                <CardDescription>Complete these tasks every day to earn rewards.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Daily tasks will be shown here.</p>
            </CardContent>
        </Card>
    );
}

function GeneralTasks() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>General Tasks</CardTitle>
                <CardDescription>One-time tasks for bigger rewards.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>General tasks will be shown here.</p>
            </CardContent>
        </Card>
    );
}


function TasksPageContent() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <header className="bg-secondary container mx-auto max-w-3xl px-4 pt-4">
            <FuturesHeader showBalance={false} />
        </header>
      
      <main className="flex-grow flex flex-col min-h-0 p-4">
        <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="mt-4">
                <DailyTasks />
            </TabsContent>
            <TabsContent value="general" className="mt-4">
                <GeneralTasks />
            </TabsContent>
        </Tabs>
      </main>
      
      <div className="sticky bottom-0">
        <BottomNav />
      </div>
    </div>
  );
}


export default function TasksPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TasksPageContent />
        </Suspense>
    )
}
