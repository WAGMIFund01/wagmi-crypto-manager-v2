export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GoogleSheetsResponse {
  success: boolean;
  data: Record<string, unknown>[];
  error?: string;
}

export interface CoinGeckoPrice {
  [symbol: string]: {
    usd: number;
  };
}
