
export interface Signal {
  id: string; 
  tradeType: 'Long' | 'Short';
  ticker: string; 
  leverage: number;
  risk: string;
  margin: number;
  entryPrice: number;
  markPrice: number;
  openTimestamp: string;
  positionMode?: 'futures' | 'spot';
  takeProfit?: string;
  stopLoss?: string;
  status: 'active' | 'pending';
  orderType: 'limit' | 'market' | 'stop-limit';
  sellHalfOnDoubling?: boolean;
}

export interface ClosedSignal extends Signal {
    closePrice: number;
    pnl: number;
    roe: number;
    closeTimestamp: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}
