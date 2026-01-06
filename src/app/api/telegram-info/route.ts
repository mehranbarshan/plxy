
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url || !url.startsWith('https://t.me/')) {
    return NextResponse.json({ error: 'Invalid or missing Telegram URL' }, { status: 400 });
  }

  try {
    // Set a realistic User-Agent and timeout to avoid being blocked
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        timeout: 8000 // 8 seconds timeout
    });
    
    const $ = cheerio.load(data);

    const title = $('meta[property="og:title"]').attr('content') || 'Unknown Title';
    const description = $('meta[property="og:description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || 'https://asset.gaminvest.org/asset/social-trading/telegram.png';

    // Try to find the exact number first, then fall back to abbreviations.
    let subscribers = 'N/A';
    const subscribersElement = $('.tgme_page_counter .counter_value');
    if (subscribersElement.length > 0) {
        subscribers = subscribersElement.text().trim();
    } else {
        // Fallback regex if the element is not found
        const subscribersMatch = data.match(/([\d\s,.]+[KMB]?) (members|subscribers)/i);
         if (subscribersMatch) {
            subscribers = subscribersMatch[1].trim();
        }
    }


    return NextResponse.json({
        name: title,
        subscribers,
        avatar: image,
        description: description.replace(/, [\d\s,.]+[KMB]? members/, ''), // Clean up description
    });

  } catch (err) {
    console.error('Error fetching Telegram info:', err);
    return NextResponse.json({ error: 'Failed to fetch channel info. The channel may be private or the link is incorrect.' }, { status: 500 });
  }
}
