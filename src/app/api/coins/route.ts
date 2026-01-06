
import { NextResponse, type NextRequest } from 'next/server';

// This endpoint is being deprecated and replaced by /api/all-cryptos to provide a comprehensive list.
// The new endpoint will fetch data from a curated static list and enrich it with live market data.

export async function GET(request: NextRequest) {
    return new NextResponse(
      JSON.stringify({ message: 'This endpoint is deprecated. Please use /api/all-cryptos.' }),
      {
        status: 410, // Gone
        headers: { 'Content-Type': 'application/json' },
      }
    );
}

    