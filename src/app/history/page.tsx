
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page has been removed and now redirects to the dashboard.
export default function HistoryPageRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return (
        <div className="flex flex-col min-h-screen bg-background font-body items-center justify-center">
            <p>Redirecting...</p>
        </div>
    );
}
