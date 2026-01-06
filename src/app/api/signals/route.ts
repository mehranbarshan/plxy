
import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Channel from '@/app/models/Channel';
import type { IChannel, ISignal } from '@/app/models/Channel';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database service is unavailable." }, { status: 503 });
    }

    // Fetch all channels and select only the signals field to be efficient
    const channels: Pick<IChannel, 'signals'>[] = await Channel.find({}, 'signals').lean();
    
    // Flatten the signals from all channels into a single array
    const allSignals = channels.flatMap(channel => channel.signals || []);

    return NextResponse.json(allSignals);
  } catch (error) {
    console.error('Error fetching signals:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: `Failed to fetch signals: ${errorMessage}` },
      { status: 500 }
    );
  }
}
