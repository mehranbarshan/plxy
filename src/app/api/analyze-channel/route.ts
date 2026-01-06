
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from '@/app/lib/mongodb';
import Channel from '@/app/models/Channel';

export async function POST(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database service is unavailable." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const channelUrlInput = body.channelUrl;

    if (!channelUrlInput || typeof channelUrlInput !== "string") {
      return NextResponse.json(
        { success: false, message: "Missing or invalid 'channelUrl'" },
        { status: 400 }
      );
    }
    
    // Extract username and make it lowercase for consistent handling
    const urlObject = new URL(channelUrlInput.startsWith('http') ? channelUrlInput : `https://t.me/${channelUrlInput.replace('@', '')}`);
    const channelUsername = urlObject.pathname.substring(1).toLowerCase();
    
    if (!channelUsername) {
         return NextResponse.json(
            { success: false, message: "Could not extract a valid channel username from the URL." },
            { status: 400 }
        );
    }

    const webhookUrl = 'http://localhost:5678/webhook/scrape-channel';
    const webhookPayload = { channelUsername };

    // Search for the channel in a case-insensitive way
    const existingChannel = await Channel.findOne({ channelId: { $regex: `^${channelUsername}$`, $options: 'i' } });

    if (existingChannel) {
      // If channel is already known to not be a signal channel, inform the user immediately.
      // This check is now redundant if non-signal channels are deleted, but it's kept for safety.
      if (existingChannel.isSignalChannel === false) {
        return NextResponse.json({
            success: false,
            message: "This channel does not provide trading signals or does not follow a professional format.",
            action: "SHOW_NON_SIGNAL_ALERT",
            channel: existingChannel
        }, { status: 400 });
      }

      // If channel exists and is a signal channel, trigger a refresh
      fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload)
      }).catch(err => {
          // Log the error but don't block the user response
          console.error(`Webhook trigger for '${channelUsername}' failed:`, err);
      });

      // Immediately return the existing channel data
      return NextResponse.json({
          success: true,
          message: "Channel already exists. Refresh request sent.",
          channel: existingChannel
      }, { status: 200 });

    } else {
      // If channel doesn't exist, create a temporary record
      const newChannel = new Channel({
          channelId: channelUsername,
          name: channelUsername, // Use username as a temporary name
          url: urlObject.toString(),
          avatar: 'https://asset.gaminvest.org/asset/social-trading/telegram.png', 
          subscribers: 0,
          description: 'Analysis in progress...',
          isStatic: false,
          isSignalChannel: undefined, // Mark as undetermined
      });
    
      await newChannel.save();

      // Trigger the webhook to start the analysis process
      fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload)
      }).catch(err => {
          console.error(`Webhook trigger for '${channelUsername}' failed:`, err);
      });
    
      return NextResponse.json({
          success: true,
          message: "Channel added and analysis started. It will appear in the list shortly.",
          channel: newChannel
      }, { status: 201 });
    }

  } catch (err: any) {
    console.error("Error in /api/analyze-channel:", err);
    // Handle potential race condition where channel is created between findOne and save
    if (err.code === 11000) { // Duplicate key error
        const channelUsernameMatch = err.message.match(/dup key: { channelId: "([^"]+)" }/);
        const conflictingChannelUsername = channelUsernameMatch ? channelUsernameMatch[1] : "the channel";
        const conflictingChannel = await Channel.findOne({ channelId: { $regex: `^${conflictingChannelUsername}$`, $options: 'i' } });
         return NextResponse.json(
            { success: true, message: `A channel with ID '${conflictingChannelUsername}' already exists.`, channel: conflictingChannel },
            { status: 200 }
        );
    }
    return NextResponse.json(
      { success: false, message: err.message || "An unknown error occurred." },
      { status: 500 }
    );
  }
}
