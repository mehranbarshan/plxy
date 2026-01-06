
import { NextResponse, type NextRequest } from 'next/server';

interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Set revalidation to 1 minute
export const revalidate = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') || '1d';
  const limit = searchParams.get('limit') || '30';

  if (!symbol) {
    return new NextResponse(
      JSON.stringify({ message: 'Symbol parameter is required.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch from Binance: ${response.statusText}`);
    }

    const data: (string | number)[][] = await response.json();

    const formattedData: KlineData[] = data.map(d => ({
      time: d[0] as number,
      open: parseFloat(d[1] as string),
      high: parseFloat(d[2] as string),
      low: parseFloat(d[3] as string),
      close: parseFloat(d[4] as string),
      volume: parseFloat(d[5] as string),
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ message: `Failed to proxy klines request to Binance: ${errorMessage}` }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
