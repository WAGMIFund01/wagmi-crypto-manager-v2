/**
 * Core types for the pricing module
 */

export interface PriceData {
  usd: number;
  usd_24h_change?: number;
}

export interface CoinGeckoPriceResponse {
  [coinGeckoId: string]: PriceData;
}

export interface AssetPriceInfo {
  symbol: string;
  coinGeckoId: string;
  currentPrice: number;
  priceChange24h?: number;
  lastUpdated: string;
}

export interface PriceUpdateResult {
  success: boolean;
  updatedCount: number;
  errors: PriceUpdateError[];
  timestamp: string;
}

export interface PriceUpdateError {
  symbol: string;
  coinGeckoId?: string;
  error: string;
  type: 'no_quantity' | 'no_coinGecko_id' | 'invalid_coinGecko_id' | 'coinGecko_error' | 'sheets_error';
}

export interface BatchPriceUpdate {
  symbol: string;
  coinGeckoId: string;
  newPrice: number;
  priceChange24h?: number;
  rowIndex: number;
}

export interface PriceUpdateSummary {
  totalAssets: number;
  updatedAssets: number;
  noQuantity: number;
  noCoinGeckoId: number;
  invalidCoinGeckoId: number;
  coinGeckoErrors: number;
  sheetsErrors: number;
}

export interface PriceServiceConfig {
  coinGeckoApiKey?: string;
  sheetId: string;
  portfolioRange: string;
  priceColumn: string;
  timestampColumn: string;
  priceChangeColumn: string;
  coinGeckoIdColumn: string;
}
