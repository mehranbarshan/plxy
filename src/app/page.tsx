'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const USERNAME_KEY = 'tradeview_username';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already logged in
    const storedUsername = localStorage.getItem(USERNAME_KEY);
    if (storedUsername) {
      // If logged in, redirect to the main app page
      router.replace('/telegram-channels');
    } else {
      // If not logged in, redirect to the login page
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
