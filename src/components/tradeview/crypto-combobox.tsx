
"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "../ui/skeleton"
import Image from "next/image"

interface CryptoInfo {
    id: string;
    symbol: string;
    name: string;
    image: string;
    lastPrice: string;
    binanceSymbol: string;
}

export type CryptoData = Pick<CryptoInfo, 'symbol' | 'lastPrice' | 'image' | 'binanceSymbol'>;

interface CryptoComboboxProps {
    selectedCrypto: { symbol: string, lastPrice: string, image: string, binanceSymbol: string } | null;
    onSelect: (value: CryptoData | null) => void;
}

export default function CryptoCombobox({ selectedCrypto, onSelect }: CryptoComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [cryptos, setCryptos] = React.useState<CryptoInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  

  React.useEffect(() => {
    async function fetchInitialCryptoData() {
      try {
        setLoading(true);
        setError(null);
        
        const apiResponse = await fetch('/api/all-cryptos');
        if (!apiResponse.ok) {
            const errorData = await apiResponse.json().catch(() => ({ message: 'Failed to fetch initial crypto data' }));
            throw new Error(errorData.message || 'Failed to fetch initial crypto data');
        }
        const apiData: CryptoInfo[] = await apiResponse.json();

        setCryptos(apiData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchInitialCryptoData();
  }, []);

  const selectedCryptoData = cryptos.find(
    (crypto) => crypto.binanceSymbol.toLowerCase() === selectedCrypto?.binanceSymbol.toLowerCase()
  );
  
  const baseAsset = selectedCryptoData?.symbol.toUpperCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-28 justify-between h-9"
        >
          {selectedCryptoData ? (
            <div className="flex items-center gap-2">
                <Image src={selectedCryptoData.image} alt={selectedCryptoData.name} width={20} height={20} className="rounded-full"/>
                {baseAsset}
            </div>
          ) : "Select coin..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Search cryptocurrency..." />
          <CommandList>
            {loading ? (
                <div className="p-2 space-y-1">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
            ) : error ? (
                <p className="p-2 text-center text-sm text-destructive">{error}</p>
            ) : (
                <>
                <CommandEmpty>No cryptocurrency found.</CommandEmpty>
                <CommandGroup>
                    {cryptos.map((crypto) => {
                       const itemBaseAsset = crypto.symbol.toUpperCase();
                       return (
                            <CommandItem
                                key={crypto.id}
                                value={`${crypto.name} ${crypto.symbol}`}
                                onSelect={(currentValue) => {
                                    const selected = cryptos.find(c => `${c.name} ${c.symbol}`.toLowerCase() === currentValue.toLowerCase()) || null;
                                    onSelect(selected ? { symbol: selected.symbol, lastPrice: selected.lastPrice, image: selected.image, binanceSymbol: selected.binanceSymbol } : null)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCrypto?.binanceSymbol.toLowerCase() === crypto.binanceSymbol.toLowerCase() ? "opacity-100" : "opacity-0"
                                )}
                                />
                                <div className="flex items-center gap-3">
                                    <Image src={crypto.image} alt={crypto.name} width={20} height={20} className="rounded-full" />
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-medium">{itemBaseAsset}</span>
                                    </div>
                                </div>
                            </CommandItem>
                        )
                    })}
                </CommandGroup>
                </>
            )}
            </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
