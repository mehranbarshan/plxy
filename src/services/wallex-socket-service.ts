
'use client';

export type PriceUpdate = {
  symbol: string;
  price: string;
  priceChangePercent: string;
};

type SubscriptionCallback = (data: PriceUpdate) => void;

class WallexSocketService {
  private static instance: WallexSocketService;
  private subscribers: Set<SubscriptionCallback> = new Set();

  private constructor() {
    // Connection logic is disabled to prevent errors.
  }

  public static getInstance(): WallexSocketService {
    if (!WallexSocketService.instance) {
      WallexSocketService.instance = new WallexSocketService();
    }
    return WallexSocketService.instance;
  }

  private connect() {
    // The connection logic has been intentionally left blank to prevent
    // WebSocket connection errors with the wss://api.wallex.ir/ws endpoint.
    // App will rely on REST API calls for data.
    return;
  }
  
  public subscribeToMarkets(symbols: string[], callback: SubscriptionCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public disconnect() {
    // No-op as connect is disabled
  }
}

export const wallexSocketService = WallexSocketService.getInstance();
