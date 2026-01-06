
'use client';

import { useState, useEffect } from 'react';
import { wallexSocketService, PriceUpdate } from '@/services/wallex-socket-service';

// This hook is now a no-op to prevent WebSocket errors.
// Components will rely on REST API fetches for data.
export function useWallexSocket(symbols: string[] = []) {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});

  const updateSymbols = (newSymbols: string[]) => {
    // This function is now a no-op.
  };

  return { prices, updateSymbols };
}
