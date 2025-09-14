/**
 * CoinGecko API types
 */

export interface CoinGeckoSimplePriceRequest {
  ids: string[];
  vs_currencies: string[];
  include_24hr_change?: boolean;
  include_last_updated_at?: boolean;
}

export interface CoinGeckoSimplePriceResponse {
  [coinGeckoId: string]: {
    usd: number;
    usd_24h_change?: number;
    last_updated_at?: number;
  };
}

export interface CoinGeckoError {
  error: string;
  status: number;
}

export interface CoinGeckoApiConfig {
  baseUrl: string;
  apiKey?: string;
  rateLimitDelay?: number;
  maxRetries?: number;
}
