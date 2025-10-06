'use client';

import { useState, useEffect } from 'react';
import { PortfolioAsset } from '@/lib/sheetsAdapter';
import { WagmiSpinner, WagmiButton, PerformerCard, RiskDistributionCard, LocationDistributionCard, AssetTypeDistributionCard } from '@/components/ui';
import PerformanceCharts from '@/components/charts/PerformanceCharts';
import { fetchPerformanceData, PerformanceData } from '@/services/performanceDataService';

interface AnalyticsData {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;
  dailyChange: number;
  dailyChangePercentage: number;
  assetCount: number;
  topPerformers: Array<{
    symbol: string;
    name: string;
    returnPercentage: number;
    value: number;
  }>;
  worstPerformers: Array<{
    symbol: string;
    name: string;
    returnPercentage: number;
    value: number;
  }>;
  riskDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
  assetTypeDistribution: Record<string, number>;
}

interface AnalyticsProps {
  onRefresh?: () => void;
  dataSource?: 'wagmi-fund' | 'personal-portfolio' | 'performance-dashboard';
  refreshKey?: number;
}

export default function Analytics({ onRefresh, dataSource = 'wagmi-fund', refreshKey }: AnalyticsProps) {

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when refreshKey changes (triggered by parent)
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      console.log('Analytics refresh triggered by refreshKey:', refreshKey);
      fetchAnalyticsData();
    }
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both portfolio data and performance data in parallel
      const apiEndpoint = dataSource === 'personal-portfolio' 
        ? '/api/get-personal-portfolio-data' 
        : '/api/get-portfolio-data';
      
      const [portfolioResponse, perfData] = await Promise.all([
        fetch(apiEndpoint),
        fetchPerformanceData()
      ]);
      
      const portfolioData = await portfolioResponse.json();
      
      if (portfolioData.success && portfolioData.assets) {
        const analytics = calculateAnalytics(portfolioData.assets);
        setAnalyticsData(analytics);
      } else {
        throw new Error('Failed to fetch portfolio data');
      }
      
      setPerformanceData(perfData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (assets: PortfolioAsset[]): AnalyticsData => {
    const totalValue = assets.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0);
    const totalInvested = assets.reduce((sum, asset) => {
      // Assuming initial investment was at a lower price - this would need historical data
      // For now, we'll estimate based on current price and a return assumption
      const estimatedInitialPrice = asset.currentPrice / (1 + (asset.priceChange24h || 0) / 100);
      return sum + (asset.quantity * estimatedInitialPrice);
    }, 0);
    
    const totalReturn = totalValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    
    const dailyChange = assets.reduce((sum, asset) => {
      const dailyChangeAmount = (asset.quantity * asset.currentPrice * (asset.priceChange24h || 0)) / 100;
      return sum + dailyChangeAmount;
    }, 0);
    
    const dailyChangePercentage = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;

    // Calculate top and worst performers - group by symbol to avoid duplicates
    const assetMap = new Map();
    
    assets.forEach(asset => {
      const symbol = asset.symbol;
      const value = asset.quantity * asset.currentPrice;
      const returnPercentage = asset.priceChange24h || 0;
      
      if (assetMap.has(symbol)) {
        // Aggregate values for the same asset across different locations
        const existing = assetMap.get(symbol);
        const oldValue = existing.value;
        const oldReturn = existing.returnPercentage;
        
        // Add the new value
        existing.value += value;
        
        // Calculate weighted average for return percentage
        // Weighted average = (oldReturn * oldValue + newReturn * newValue) / (oldValue + newValue)
        existing.returnPercentage = ((oldReturn * oldValue) + (returnPercentage * value)) / existing.value;
      } else {
        assetMap.set(symbol, {
          symbol: asset.symbol,
          name: asset.assetName,
          returnPercentage: returnPercentage,
          value: value
        });
      }
    });
    
    const performers = Array.from(assetMap.values()).sort((a, b) => b.returnPercentage - a.returnPercentage);

    const topPerformers = performers.slice(0, 5);
    const worstPerformers = performers.slice(-5).reverse();

    // Calculate distributions
    const riskDistribution = assets.reduce((acc, asset) => {
      acc[asset.riskLevel] = (acc[asset.riskLevel] || 0) + (asset.quantity * asset.currentPrice);
      return acc;
    }, {} as Record<string, number>);

    const locationDistribution = assets.reduce((acc, asset) => {
      acc[asset.location] = (acc[asset.location] || 0) + (asset.quantity * asset.currentPrice);
      return acc;
    }, {} as Record<string, number>);

    const assetTypeDistribution = assets.reduce((acc, asset) => {
      acc[asset.coinType] = (acc[asset.coinType] || 0) + (asset.quantity * asset.currentPrice);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalValue,
      totalInvested,
      totalReturn,
      totalReturnPercentage,
      dailyChange,
      dailyChangePercentage,
      assetCount: assets.length,
      topPerformers,
      worstPerformers,
      riskDistribution,
      locationDistribution,
      assetTypeDistribution
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <WagmiSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <WagmiButton 
          onClick={fetchAnalyticsData}
          variant="primary"
          theme="green"
          size="md"
        >
          Retry
        </WagmiButton>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  // Performance dashboard doesn't use this component
  if (dataSource === 'performance-dashboard') {
    return null;
  }

  return (
    <div className="space-y-6">

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <PerformerCard
          title="Top Performers (24h)"
          performers={analyticsData.topPerformers}
          type="top"
          formatPercentage={formatPercentage}
          formatCurrency={formatCurrency}
        />
        <PerformerCard
          title="Worst Performers (24h)"
          performers={analyticsData.worstPerformers}
          type="worst"
          formatPercentage={formatPercentage}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Portfolio Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <LocationDistributionCard
          data={analyticsData.locationDistribution}
          totalValue={analyticsData.totalValue}
          formatValue={formatCurrency}
        />
        <AssetTypeDistributionCard
          data={analyticsData.assetTypeDistribution}
          totalValue={analyticsData.totalValue}
          formatValue={formatCurrency}
        />
        <RiskDistributionCard
          data={analyticsData.riskDistribution}
          totalValue={analyticsData.totalValue}
          formatValue={formatCurrency}
        />
      </div>

      {/* Performance Charts Section */}
      {performanceData.length > 0 && (
        <div className="mt-8">
          <PerformanceCharts data={performanceData} />
        </div>
      )}
    </div>
  );
}
