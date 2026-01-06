
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.alternative.me/fng/',
      {
        next: {
          revalidate: 3600, // Revalidate every hour
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch from alternative.me: ${response.statusText}`);
    }

    const data = await response.json();
    
    // The API returns an array of data, we only need the latest value which is the first element.
    const latestData = data?.data?.[0];

    if (!latestData) {
      throw new Error('Invalid data structure from alternative.me API');
    }

    return NextResponse.json(latestData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ message: `Failed to fetch Fear & Greed data: ${errorMessage}` }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
