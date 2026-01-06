
// A simple map for high-priority crypto icons to avoid reliance on potentially changing image URLs from the API.
// It also serves as a fallback mechanism.

const iconMap: Record<string, string> = {
    btc: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    eth: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    bnb: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png',
    sol: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    xrp: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    usdt: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    ada: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    doge: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    trx: 'https://assets.coingecko.com/coins/images/902/large/tron-logo.png',
    link: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    usdc: 'https://assets.coingecko.com/coins/images/6319/large/usdc.png',
    fdusd: 'https://assets.coingecko.com/coins/images/31075/large/fdusd.png',
    trump: 'https://assets.coingecko.com/coins/images/35091/large/magacoin.png'
    // Add other high-priority icons as needed.
};

/**
 * Gets the icon for a cryptocurrency.
 * It first checks a local map for high-priority icons.
 * If not found, it falls back to the provided URL from the API.
 *
 * @param symbol The symbol of the cryptocurrency (e.g., 'btc').
 * @param fallbackUrl The URL from the API to use if the symbol is not in the local map.
 * @returns The URL of the icon.
 */
export const getCryptoIcon = (symbol: string, fallbackUrl: string): string => {
  const lowerCaseSymbol = symbol.toLowerCase();
  return iconMap[lowerCaseSymbol] || fallbackUrl;
};
