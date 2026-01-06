
import {NextResponse} from 'next/server';

export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  try {
    const apiKey = process.env.COINGECKO_DEMO_API_KEY;
    if (!apiKey) {
      console.warn('CoinGecko API key is not configured. The /api/global endpoint will return empty data.');
      // Return a successful but empty response to prevent client-side errors.
      return NextResponse.json({ data: {} });
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/global?x_cg_demo_api_key=${apiKey}`
    );

    if (!response.ok) {
       throw new Error(`Failed to fetch from CoinGecko: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({message: `Failed to fetch global data: ${errorMessage}`}),
      {
        status: 500,
        headers: {'Content-Type': 'application/json'},
      }
    );
  }
}
