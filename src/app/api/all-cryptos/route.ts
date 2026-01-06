
import { NextResponse } from 'next/server';
import type { MergedCoinData } from '@/types/coin-data';

export async function GET() {
  try {
    // گرفتن 50 رمزارز برتر از CoinGecko
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false');
         
    if (!response.ok) {
      throw new Error(`CoinGecko API failed with status ${response.status}`);
    }

    const data = await response.json();

    const formattedData: MergedCoinData[] = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      lastPrice: coin.current_price.toString(),
      binanceSymbol: `${coin.symbol.toUpperCase()}USDT`,
      priceChangePercent: coin.price_change_percentage_24h?.toString(),
      quoteVolume: coin.total_volume?.toString(),
      marketCap: coin.market_cap,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({message: `Failed to fetch all-cryptos data: ${errorMessage}`}),
      {
        status: 500,
        headers: {'Content-Type': 'application/json'},
      }
    );
  }
}
