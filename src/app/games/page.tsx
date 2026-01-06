
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page redirects to the main games lobby or the first game.
export default function GamesPageRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/games/miners');
    }, [router]);

    return (
        <div className="flex flex-col min-h-screen bg-background font-body items-center justify-center">
            <p>Redirecting to the games lobby...</p>
        </div>
    );
}
