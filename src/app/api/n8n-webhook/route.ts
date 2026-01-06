
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from '@/app/lib/mongodb';
import Channel from '@/app/models/Channel';
import type { IChannel, ISignal } from "@/app/models/Channel";
import mongoose from "mongoose";

// This defines a plain object type for signals from n8n, before they become Mongoose subdocuments
type PlainSignalObject = {
    type: 'Long' | 'Short';
    asset: string;
    entry: number;
    targets: number[];
    stopLoss?: number;
    timestamp: string;
    status: 'active' | 'closed';
    pnl?: number;
}


const getEntryPrice = (entry: string | number): number => {
    if (typeof entry === 'number') return entry;
    if (typeof entry === 'string') {
        const cleanEntry = entry.replace(/[^0-9.-]/g, ''); 
        const parts = cleanEntry.split('-').map(part => parseFloat(part.trim()));
        
        if (parts.length > 1 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return (parts[0] + parts[1]) / 2;
        }
        if (!isNaN(parts[0])) {
            return parts[0];
        }
    }
    return 0;
};

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
    const { channelUsername, trading_signal } = body;

    console.log("Received n8n webhook for:", channelUsername);

    if (!channelUsername) {
        return NextResponse.json({ success: false, message: "channelUsername is missing" }, { status: 400 });
    }
    
    const lowerCaseUsername = channelUsername.toLowerCase().replace('@', '');
    
    // Scenario 1: It's NOT a signal channel -> Delete it
    if (trading_signal === 'No') {
        const deletedChannel = await Channel.findOneAndDelete(
             { channelId: { $regex: new RegExp(`^${lowerCaseUsername}$`, 'i') } }
        );

        if (deletedChannel) {
             return NextResponse.json({ 
                success: true, 
                message: "Channel was not a signal channel and has been removed.",
                action: "SHOW_NON_SIGNAL_ALERT_And_Remove",
                channel: deletedChannel
            }, { status: 200 });
        }
       
        return NextResponse.json({ 
            success: true, 
            message: "Channel marked as not a signal channel.",
            action: "SHOW_NON_SIGNAL_ALERT"
        }, { status: 200 });
    }

    // Scenario 2: It IS a signal channel
    if (trading_signal === 'Yes') {
        
        const analysisResultArray = body.analysisResult;
        if (!analysisResultArray || !Array.isArray(analysisResultArray) || analysisResultArray.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "Trading signal is YES but analysisResult is missing or empty." 
            }, { status: 400 });
        }

        const result = analysisResultArray[0];
        const channelInfo = result.channel_info;
        const analysisSignals = result.signals;
        
        let signals: PlainSignalObject[] = [];
        if (Array.isArray(analysisSignals)) {
            signals = analysisSignals
                .filter((s: any) => s.type === 'new' && s.symbol)
                .map((s: any) => ({
                    type: s.direction?.toLowerCase() === 'short' ? 'Short' : 'Long',
                    asset: s.symbol.replace('#', '').replace('/USDT', '').toUpperCase(),
                    entry: getEntryPrice(s.entry),
                    targets: Array.isArray(s.tp) ? s.tp.map((p: any) => parseFloat(p)) : [],
                    stopLoss: s.sl ? parseFloat(s.sl) : undefined,
                    timestamp: s.date && s.time ? new Date(`${s.date} ${s.time}`).toISOString() : new Date().toISOString(),
                    status: 'active',
                }));
        }
        
        const updateData: Partial<IChannel> = {
            isSignalChannel: true,
            signals: signals as any,
        };
        
        if (channelInfo) {
            updateData.name = channelInfo.name || lowerCaseUsername;
            updateData.description = channelInfo.description;
            if (channelInfo.avatar) updateData.avatar = channelInfo.avatar;
            updateData.subscribers = channelInfo.subscribers;
            if (channelInfo.accuracy) {
                 const accuracyValue = parseFloat(channelInfo.accuracy.replace('%', ''));
                 if (!isNaN(accuracyValue)) {
                     updateData.accuracy = accuracyValue;
                 }
            }
        }

        const updatedChannel = await Channel.findOneAndUpdate(
            { channelId: { $regex: new RegExp(`^${lowerCaseUsername}$`, 'i') } },
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ 
            success: true, 
            message: "Channel data updated successfully.",
            channel: updatedChannel,
            action: "REDIRECT_TO_CHANNEL"
        }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: "Invalid trading_signal value." }, { status: 400 });

  } catch (err: any) {
    console.error("Error in /api/n8n-webhook:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
