
export interface Signal {
    id: string;
    type: 'Long' | 'Short';
    asset: string;
    entry: number;
    targets: number[];
    stopLoss: number;
    timestamp: string;
    status: 'active' | 'closed';
    pnl?: number;
}

export interface Channel {
    id: string;
    name: string;
    avatar: string;
    subscribers: number;
    description: string;
    risk: 'Low' | 'Medium' | 'High';
    winRate: number;
    rating: number;
    reviews: number;
    signals: Signal[];
    url?: string;
    isStatic?: boolean;
}


export const channels: Channel[] = [
    { 
        id: "1", 
        name: "Crypto Pump Station", 
        avatar: "https://placehold.co/100x100/7c3aed/white?text=PS", 
        subscribers: 125432, 
        description: "Daily signals for top crypto pumps and short-term gains. High-risk, high-reward plays for experienced traders.", 
        risk: 'High', 
        winRate: 75, 
        rating: 4.5,
        reviews: 1200,
        signals: [
            { id: 's1-1', type: 'Long', asset: 'DOGE', entry: 0.15, targets: [0.16, 0.17], stopLoss: 0.14, timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'active' },
            { id: 's1-2', type: 'Short', asset: 'SHIB', entry: 0.000025, targets: [0.000024, 0.000023], stopLoss: 0.000026, timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'closed', pnl: 8.5 },
        ],
        isStatic: true,
    },
    { 
        id: "2", 
        name: "Whale Blockchain Alerts", 
        avatar: "https://placehold.co/100x100/1d4ed8/white?text=WA", 
        subscribers: 512899, 
        description: "Real-time tracking of large cryptocurrency transactions. We analyze whale movements to predict market trends.", 
        risk: 'Low', 
        winRate: 95, 
        rating: 4.9,
        reviews: 2500,
        signals: [
            { id: 's2-1', type: 'Long', asset: 'BTC', entry: 68000, targets: [70000, 72000], stopLoss: 67000, timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'active' },
            { id: 's2-2', type: 'Long', asset: 'ETH', entry: 3800, targets: [3900, 4000], stopLoss: 3750, timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'closed', pnl: 5.2 },
        ],
        isStatic: true,
    },
    { 
        id: "3", 
        name: "DeFi Signal Masters", 
        avatar: "https://placehold.co/100x100/c2410c/white?text=DM", 
        subscribers: 78123, 
        description: "High-quality signals and discussions for DeFi gems and yield farming opportunities. Focused on long-term value.", 
        risk: 'Medium', 
        winRate: 82, 
        rating: 4.7,
        reviews: 850,
        signals: [
            { id: 's3-1', type: 'Long', asset: 'UNI', entry: 10, targets: [11, 12], stopLoss: 9.5, timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), status: 'active' },
        ],
        isStatic: true,
    },
    { 
        id: "4", 
        name: "Crypto News Feed", 
        avatar: "https://placehold.co/100x100/16a34a/white?text=CN", 
        subscribers: 250000, 
        description: "The latest news and analysis from the world of cryptocurrency. We help you stay ahead of the market.", 
        risk: 'Low', 
        winRate: 79, 
        rating: 4.6,
        reviews: 1800,
        signals: [],
        isStatic: true,
    },
    { 
        id: "5", 
        name: "Bitcoin Scalpers", 
        avatar: "https://placehold.co/100x100/f59e0b/white?text=BS", 
        subscribers: 45000, 
        description: "High-frequency scalping signals for BTC. Quick trades for quick profits. Not for the faint of heart.", 
        risk: 'High', 
        winRate: 78, 
        rating: 4.4,
        reviews: 500,
        signals: [],
        isStatic: true,
    },
    {
      id: "1720542749493",
      name: "مهدیه ترید | Mahdiye Trade",
      avatar: "https://cdn4.telesco.pe/file/P2iS_1O1E5nQzNKsH2Flr2wYp8V2fO3Qp2vX-a2hBvjC_tC4g0T_4Q_2_lR-d9T4sVj_9C3aB8A1d-Z_wX-o7Z.jpg",
      subscribers: 198000,
      description: "سیگنال ترید کریپتو",
      risk: 'Medium',
      winRate: 81,
      rating: 4.6,
      reviews: 950,
      signals: [],
      isStatic: true,
    }
];

export function getChannelById(id: string): Channel | undefined {
    // Note: In a real app, you'd fetch this from a database.
    // The `id` might be a string representation of a number.
    return channels.find(channel => channel.id == id);
}
