
import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channelUrl, channelLink } = body;
    const targetUrl = channelUrl || channelLink;

    if (!targetUrl || typeof targetUrl !== "string") {
      return NextResponse.json(
        { success: false, message: "Missing or invalid 'channelUrl' or 'channelLink'" },
        { status: 400 }
      );
    }
    
    const url = targetUrl.startsWith('http') ? targetUrl : `https://t.me/${targetUrl.replace('@', '')}`;
    
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        timeout: 8000
    });
    
    const $ = cheerio.load(data);

    const title = $('meta[property="og:title"]').attr('content') || 'Unknown Title';
    const description = $('meta[property="og:description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || 'https://asset.gaminvest.org/asset/social-trading/telegram.png';
    
    let subscribers = 'N/A';
    const subscribersElement = $('.tgme_page_counter .counter_value');
    if (subscribersElement.length > 0) {
        subscribers = subscribersElement.text().trim();
    } else {
        const subscribersMatch = data.match(/([\d\s,.]+[KMB]?) (members|subscribers)/i);
         if (subscribersMatch) {
            subscribers = subscribersMatch[1].trim();
        }
    }

    const channelInfo = {
        name: title,
        description: description.replace(/, [\d\s,.]+[KMB]? members/, ''),
        subscribers: subscribers,
        avatar: image,
    };
    
    // Trigger the n8n webhook
    const urlObject = new URL(url);
    const channelUsername = urlObject.pathname.substring(1);
    const webhookUrl = 'http://localhost:5678/webhook/scrape-channel';
    if (channelUsername) {
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelUsername })
        }).catch(err => {
            // Log the error but don't fail the request
            console.error("Webhook trigger for analysis failed:", err);
        });
    }

    return NextResponse.json({
        success: true,
        channelInfo: channelInfo,
        messages: "Live data fetched successfully.",
    }, { status: 200 });

  } catch (err: any) {
    console.error("Error in /api/analyze-telegram:", err);
    return NextResponse.json(
      { success: false, message: err.message || "An unknown error occurred during channel analysis." },
      { status: 500 }
    );
  }
}
