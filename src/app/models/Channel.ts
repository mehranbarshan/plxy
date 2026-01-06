
import mongoose, { Schema, Document, models, Model } from 'mongoose';

// Define ISignal as a type that includes Mongoose's Subdocument properties
// This avoids extending Document and causing _id conflicts.
export type ISignal = mongoose.Types.Subdocument & {
    _id?: mongoose.Types.ObjectId;
    type: 'Long' | 'Short';
    asset: string;
    entry: number;
    targets: number[];
    stopLoss?: number;
    timestamp: string;
    status: 'active' | 'closed';
    pnl?: number;
};

const SignalSchema: Schema = new Schema({
    type: { type: String, enum: ['Long', 'Short'], required: true },
    asset: { type: String, required: true },
    entry: { type: Number, required: true },
    targets: { type: [Number], required: true },
    stopLoss: { type: Number, required: false },
    timestamp: { type: String, required: true },
    status: { type: String, enum: ['active', 'closed'], required: true },
    pnl: { type: Number },
});


export interface IChannel extends Document {
    channelId: string;
    name: string;
    avatar: string;
    subscribers?: number;
    description: string;
    risk: 'Low' | 'Medium' | 'High';
    accuracy: number;
    rating: number;
    reviews: number;
    signals: ISignal[];
    url?: string;
    isStatic?: boolean;
    isSignalChannel?: boolean;
}

const ChannelSchema: Schema = new Schema({
  channelId: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  avatar: { type: String },
  subscribers: { type: Number },
  description: { type: String },
  risk: { type: String, enum: ['Low', 'Medium', 'High'] },
  accuracy: { type: Number },
  rating: { type: Number },
  reviews: { type: Number },
  signals: [SignalSchema],
  url: { type: String },
  isStatic: { type: Boolean, default: false },
  isSignalChannel: { type: Boolean },
});

// To handle case-insensitivity for channelId searches and ensure uniqueness
ChannelSchema.pre<IChannel>('save', function(this: IChannel, next) {
    if (this.channelId) {
        this.channelId = this.channelId.toLowerCase();
    }
    next();
});

const Channel: Model<IChannel> = models.Channel || mongoose.model<IChannel>('Channel', ChannelSchema);

export default Channel;
