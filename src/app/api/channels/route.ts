
import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Channel from '@/app/models/Channel';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      // Return an empty array if DB is not available, to prevent client-side errors
      return NextResponse.json([]);
    }
    const channels = await Channel.find({});
    
    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    // Even on error, return an empty array to ensure the client doesn't crash.
    // The error is logged on the server for debugging.
    return NextResponse.json([]);
  }
}
