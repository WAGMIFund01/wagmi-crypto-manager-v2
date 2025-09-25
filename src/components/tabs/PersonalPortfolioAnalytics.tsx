'use client';

import { useState, useEffect } from 'react';
import { PortfolioAsset } from '@/lib/sheetsAdapter';
import { WagmiCard, WagmiSpinner, WagmiButton } from '@/components/ui';
import { COLORS } from '@/shared/constants/colors';

interface PersonalPortfolioAnalyticsData {
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
  chainDistribution: Record<string, number>;
  assetTypeDistribution: Record<string, number>;
}

interface PersonalPortfolioAnalyticsProps {
  onRefresh?: () => void;
}

export default function PersonalPortfolioAnalytics({ onRefresh }: PersonalPortfolioAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<PersonalPortfolioAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when onRefresh callback changes (triggered by parent)
  useEffect(() => {
    if (onRefresh) {
      fetchAnalyticsData();
    }
  }, [onRefresh]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch personal portfolio data
      const portfolioResponse = await fetch('/api/get-personal-portfolio-data');
      const portfolioData = await portfolioResponse.json();
      
      if (portfolioData.success && portfolioData.assets) {
        const analytics = calculateAnalytics(portfolioData.assets);
        setAnalyticsData(analytics);
      } else {
        throw new Error('Failed to fetch personal portfolio data');
      }
    } catch (err) {
      console.error('Error fetching personal portfolio analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load personal portfolio analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (assets: PortfolioAsset[]): PersonalPortfolioAnalyticsData => {
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

    const chainDistribution = assets.reduce((acc, asset) => {
      acc[asset.chain] = (acc[asset.chain] || 0) + (asset.quantity * asset.currentPrice);
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
      chainDistribution,
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
        <p className="text-gray-400">No personal portfolio analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Top Performers */}
        <WagmiCard variant="default" theme="green" size="lg">
          <div className="pt-2 pb-4 px-4 md:pt-3 md:pb-6 md:px-6">
            <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.text.primary }}>Top Performers (24h)</h3>
            <div className="space-y-2 md:space-y-3">
              {analyticsData.topPerformers.map((asset, index) => (
                <div key={asset.symbol} className="flex items-center justify-between p-2 md:p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-medium text-sm md:text-base truncate">{asset.symbol}</div>
                      <div className="text-gray-400 text-xs md:text-sm truncate">{asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-green-400 font-medium text-sm md:text-base">
                      {formatPercentage(asset.returnPercentage)}
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm">
                      {formatCurrency(asset.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WagmiCard>

        {/* Worst Performers */}
        <WagmiCard variant="default" theme="green" size="lg">
          <div className="pt-2 pb-4 px-4 md:pt-3 md:pb-6 md:px-6">
            <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.text.primary }}>Worst Performers (24h)</h3>
            <div className="space-y-2 md:space-y-3">
              {analyticsData.worstPerformers.map((asset, index) => (
                <div key={asset.symbol} className="flex items-center justify-between p-2 md:p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-medium text-sm md:text-base truncate">{asset.symbol}</div>
                      <div className="text-gray-400 text-xs md:text-sm truncate">{asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-red-400 font-medium text-sm md:text-base">
                      {formatPercentage(asset.returnPercentage)}
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm">
                      {formatCurrency(asset.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WagmiCard>
      </div>

      {/* Portfolio Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Risk Distribution */}
        <WagmiCard variant="default" theme="green" size="lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.riskDistribution).map(([risk, value]) => {
                const percentage = (value / analyticsData.totalValue) * 100;
                const color = (COLORS.risk as any)[risk.toLowerCase()] || '#6B7280';
                return (
                  <div key={risk} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{risk}</span>
                      <span className="text-white font-medium">{formatCurrency(value)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </WagmiCard>

        {/* Chain Distribution */}
        <WagmiCard variant="default" theme="green" size="lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Chain Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.chainDistribution).map(([chain, value]) => {
                const percentage = (value / analyticsData.totalValue) * 100;
                const color = (COLORS.chain as any)[chain.toLowerCase()] || '#6B7280';
                return (
                  <div key={chain} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{chain}</span>
                      <span className="text-white font-medium">{formatCurrency(value)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </WagmiCard>

        {/* Asset Type Distribution */}
        <WagmiCard variant="default" theme="green" size="lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Asset Type Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.assetTypeDistribution).map(([type, value]) => {
                const percentage = (value / analyticsData.totalValue) * 100;
                const color = (COLORS.assetType as any)[type.toLowerCase()] || '#6B7280';
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{type}</span>
                      <span className="text-white font-medium">{formatCurrency(value)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </WagmiCard>
      </div>
    </div>
  );
}
