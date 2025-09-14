import { PriceServiceConfig } from '../types/pricing';

/**
 * Configuration for the pricing module
 */
export const pricingConfig: PriceServiceConfig = {
  coinGeckoApiKey: process.env.COINGECKO_API_KEY,
  sheetId: process.env.GOOGLE_SHEET_ID || '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM',
  portfolioRange: 'Portfolio Overview!A:L',
  priceColumn: 'H', // Current price column
  timestampColumn: 'J', // Last update timestamp column
  priceChangeColumn: 'L', // 24hr price change column
  coinGeckoIdColumn: 'K' // CoinGecko ID column
};

/**
 * Default CoinGecko API configuration
 */
export const coinGeckoConfig = {
  baseUrl: 'https://api.coingecko.com/api/v3',
  rateLimitDelay: 1000, // 1 second between requests
  maxRetries: 3,
  timeout: 10000 // 10 seconds
};

/**
 * Price update intervals (in milliseconds)
 */
export const updateIntervals = {
  manual: 0,
  frequent: 60000, // 1 minute
  normal: 300000, // 5 minutes
  slow: 900000, // 15 minutes
  verySlow: 3600000 // 1 hour
} as const;

/**
 * Symbol to CoinGecko ID mapping (fallback for assets without CoinGecko ID in sheet)
 */
export const symbolToCoinGeckoId: Record<string, string> = {
  'AURA': 'aura-network',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'BTC': 'bitcoin',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'NEAR': 'near'
};
