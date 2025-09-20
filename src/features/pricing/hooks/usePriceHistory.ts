import { useState, useEffect, useCallback } from 'react';
import { CoinGeckoService } from '../services/CoinGeckoService';

export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  marketCap?: number;
  volume24h?: number;
}

export interface PriceHistoryData {
  symbol: string;
  coinGeckoId: string;
  prices: PriceHistoryPoint[];
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
}

export interface UsePriceHistoryOptions {
  days?: number;
  interval?: 'hourly' | 'daily';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UsePriceHistoryReturn {
  data: PriceHistoryData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching and managing price history data
 */
export function usePriceHistory(
  symbol: string,
  coinGeckoId: string,
  coinGeckoService: CoinGeckoService,
  options: UsePriceHistoryOptions = {}
): UsePriceHistoryReturn {
  const {
    days = 7,
    interval = 'daily',
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes
  } = options;

  const [data, setData] = useState<PriceHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPriceHistory = useCallback(async () => {
    if (!coinGeckoId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch price history from CoinGecko
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinGeckoId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price history: ${response.status}`);
      }
      
      const historyData = await response.json();
      
      // Transform the data
      const prices: PriceHistoryPoint[] = historyData.prices.map((point: [number, number]) => ({
        timestamp: point[0],
        price: point[1]
      }));
      
      const marketCaps = historyData.market_caps?.map((point: [number, number]) => ({
        timestamp: point[0],
        marketCap: point[1]
      })) || [];
      
      const volumes = historyData.total_volumes?.map((point: [number, number]) => ({
        timestamp: point[0],
        volume24h: point[1]
      })) || [];
      
      // Merge market cap and volume data
      const enrichedPrices = prices.map(pricePoint => {
        const marketCapPoint = marketCaps.find((mc: any) => mc.timestamp === pricePoint.timestamp);
        const volumePoint = volumes.find((v: any) => v.timestamp === pricePoint.timestamp);
        
        return {
          ...pricePoint,
          marketCap: marketCapPoint?.marketCap,
          volume24h: volumePoint?.volume24h
        };
      });
      
      // Calculate price changes
      const currentPrice = enrichedPrices[enrichedPrices.length - 1]?.price || 0;
      const price24hAgo = enrichedPrices[Math.max(0, enrichedPrices.length - 2)]?.price || 0;
      const price7dAgo = enrichedPrices[Math.max(0, enrichedPrices.length - 8)]?.price || 0;
      const price30dAgo = enrichedPrices[Math.max(0, enrichedPrices.length - 31)]?.price || 0;
      
      const priceChange24h = price24hAgo > 0 ? ((currentPrice - price24hAgo) / price24hAgo) * 100 : 0;
      const priceChange7d = price7dAgo > 0 ? ((currentPrice - price7dAgo) / price7dAgo) * 100 : 0;
      const priceChange30d = price30dAgo > 0 ? ((currentPrice - price30dAgo) / price30dAgo) * 100 : 0;
      
      const priceHistoryData: PriceHistoryData = {
        symbol,
        coinGeckoId,
        prices: enrichedPrices,
        priceChange24h,
        priceChange7d,
        priceChange30d
      };
      
      setData(priceHistoryData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [symbol, coinGeckoId, days, interval]);

  const refetch = useCallback(() => {
    return fetchPriceHistory();
  }, [fetchPriceHistory]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPriceHistory();
  }, [fetchPriceHistory]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPriceHistory();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchPriceHistory]);

  return {
    data,
    isLoading,
    error,
    refetch,
    clearError
  };
}
