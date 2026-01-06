

"use client";

import { useState, useEffect, useCallback } from "react";
import type { CryptoData } from "@/components/tradeview/crypto-combobox";

type OrderType = "market" | "limit" | "stop-limit";

const FUTURES_DRAFT_KEY = 'tradeview_futures_draft';
const TPSL_DRAFT_KEY = 'tradeview_tpsl_draft_settings';

export function useLocalStorageCrypto(
  storageKey: string,
  searchParams: URLSearchParams | any
) {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [price, setPrice] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [high24h, setHigh24h] = useState<string | null>(null);
  const [low24h, setLow24h] = useState<string | null>(null);

  // Initial data loading effect from URL params or localStorage
  useEffect(() => {
    const symbol = searchParams.get("symbol");
    const priceParam = searchParams.get("price");
    const image = searchParams.get("image");

    if (symbol && priceParam && image) {
      const preSelected: CryptoData = {
        symbol,
        lastPrice: priceParam,
        image,
        binanceSymbol: symbol,
      };
      updateSelectedCrypto(preSelected);
    } else {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed: CryptoData = JSON.parse(saved);
          setSelectedCrypto(parsed);
        } catch (e) {
          console.error("Failed to parse crypto data from localStorage", e);
          localStorage.removeItem(storageKey);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, searchParams]);

  // Effect to update price and 24h data based on selections
  useEffect(() => {
    async function fetchAndUpdate24hData(symbol: string) {
        try {
            const response = await fetch(`/api/klines?symbol=${symbol}&interval=1d&limit=1`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const kline = data[0];
                    setHigh24h(kline.high.toString());
                    setLow24h(kline.low.toString());
                }
            }
        } catch (error) {
            console.error("Failed to fetch 24h kline data", error);
        }
    }

    if (selectedCrypto) {
      if (orderType === "market" || !price) {
        setPrice(parseFloat(selectedCrypto.lastPrice).toString());
      }
      fetchAndUpdate24hData(selectedCrypto.binanceSymbol);
    } else {
        setPrice("");
        setHigh24h(null);
        setLow24h(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCrypto, orderType]);
  
  const updateSelectedCrypto = useCallback((crypto: CryptoData | null) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(FUTURES_DRAFT_KEY);
        localStorage.removeItem(TPSL_DRAFT_KEY);
    }
    setSelectedCrypto(crypto);
    if (crypto) {
        localStorage.setItem(storageKey, JSON.stringify(crypto));
        setPrice(parseFloat(crypto.lastPrice).toString());
    } else {
        localStorage.removeItem(storageKey);
        setPrice("");
    }
  }, [storageKey]);


  return {
    selectedCrypto,
    updateSelectedCrypto,
    price,
    setPrice,
    orderType,
    setOrderType,
    high24h,
    low24h
  };
}
