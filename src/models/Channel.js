
import mongoose from 'mongoose';

const SignalSchema = new mongoose.Schema({
    id: String,
    type: String, // 'Long' | 'Short'
    asset: String,
    entry: Number,
    targets: [Number],
    stopLoss: Number,
    timestamp: String,
    status: String, // 'active' | 'closed'
    pnl: Number,
}, {id: false});


const ChannelSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    avatar: String,
    subscribers: String,
    description: String,
    isStatic: { type: Boolean, default: false }, // Flag to differentiate from original static data
    category: { type: String, default: 'other' }, // To store AI-generated category
    // Fields for analyzed data - can be populated later
    risk: String, 
    winRate: Number, 
    rating: Number,
    reviews: Number,
    signals: [SignalSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
}, { timestamps: true });


ChannelSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Channel || mongoose.model('Channel', ChannelSchema);
