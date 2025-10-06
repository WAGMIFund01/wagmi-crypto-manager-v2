'use client';

import { useState, useEffect, useMemo } from 'react';
import { WagmiSpinner, WagmiButton, StackedBarChart, RiskDistributionCard, LocationDistributionCard, AssetTypeDistributionCard, DistributionCardSkeleton, ChartSkeleton } from '@/components/ui';
import EnhancedPerformanceCharts from '@/components/charts/EnhancedPerformanceCharts';
import { fetchPersonalPortfolioPerformanceData } from '@/services/personalPortfolioPerformanceDataService';
import { PersonalPortfolioPerformanceData } from '@/shared/types/performance';
import { PortfolioAsset } from '@/lib/sheetsAdapter';
import { COLORS } from '@/shared/constants/colors';

interface HouseholdAnalyticsProps {
  onRefresh?: () => void;
  refreshKey?: number;
}

export default function HouseholdAnalytics({ onRefresh, refreshKey }: HouseholdAnalyticsProps) {
  const [performanceData, setPerformanceData] = useState<PersonalPortfolioPerformanceData[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when refreshKey changes (triggered by parent)
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      console.log('Household Analytics refresh triggered by refreshKey:', refreshKey);
      fetchAnalyticsData();
    }
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
      
      // Fetch both performance data and portfolio data in parallel
      const [perfData, portfolioResponse] = await Promise.all([
        fetchPersonalPortfolioPerformanceData(),
        fetch('/api/get-personal-portfolio-data')
      ]);

      setPerformanceData(perfData);

      if (portfolioResponse.ok) {
        const portfolioResult = await portfolioResponse.json();
        if (portfolioResult.success && portfolioResult.assets) {
          setPortfolioData(portfolioResult.assets);
        }
      }
    } catch (err) {
      console.error('🏠 HouseholdAnalytics: Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate portfolio distributions for charts and cards
  const { assetDistribution, assetColors, locationDistribution, assetTypeDistribution, detailedRiskDistribution, totalValue } = useMemo(() => {
    if (!portfolioData || portfolioData.length === 0) {
      return {
        assetDistribution: {} as Record<string, number>,
        assetColors: [],
        locationDistribution: {} as Record<string, number>,
        assetTypeDistribution: {} as Record<string, number>,
        detailedRiskDistribution: {} as Record<string, number>,
        totalValue: 0
      };
    }

    // Calculate total value
    const totalValue = portfolioData.reduce((sum, asset) => sum + (asset.totalValue || 0), 0);

    // Asset distribution for stacked bar chart
    const assetDistribution = portfolioData.reduce((acc, asset) => {
      if (asset.totalValue && asset.totalValue > 0) {
        const assetName = asset.symbol || 'Unknown';
        acc[assetName] = (acc[assetName] || 0) + asset.totalValue;
      }
      return acc;
    }, {} as Record<string, number>);

    // Asset colors for the chart
    const chartColors = Object.values(COLORS.chart);
    const assetColors = Object.keys(assetDistribution).map((_, index) => chartColors[index % chartColors.length]);

    // Location distribution
    const locationDistribution = portfolioData.reduce((acc, asset) => {
      if (asset.totalValue && asset.totalValue > 0) {
        const location = asset.location || 'Unknown';
        acc[location] = (acc[location] || 0) + asset.totalValue;
      }
      return acc;
    }, {} as Record<string, number>);

    // Asset type distribution
    const assetTypeDistribution = portfolioData.reduce((acc, asset) => {
      if (asset.totalValue && asset.totalValue > 0) {
        const assetType = asset.coinType || 'Unknown';
        acc[assetType] = (acc[assetType] || 0) + asset.totalValue;
      }
      return acc;
    }, {} as Record<string, number>);

    // Risk distribution
    const detailedRiskDistribution = portfolioData.reduce((acc, asset) => {
      if (asset.totalValue && asset.totalValue > 0) {
        const riskLevel = asset.riskLevel || 'Unknown';
        acc[riskLevel] = (acc[riskLevel] || 0) + asset.totalValue;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      assetDistribution,
      assetColors,
      locationDistribution,
      assetTypeDistribution,
      detailedRiskDistribution,
      totalValue
    };
  }, [portfolioData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Performance Charts Skeleton */}
        <div className="flex items-center justify-center min-h-[400px]">
          <WagmiSpinner size="lg" />
        </div>

        {/* Asset Breakdown Chart Skeleton */}
        <div className="grid grid-cols-1 gap-6">
          <ChartSkeleton />
        </div>

        {/* Portfolio Distribution Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          <DistributionCardSkeleton />
          <DistributionCardSkeleton />
          <DistributionCardSkeleton />
        </div>
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


  return (
    <div className="space-y-6">
      {/* Portfolio Breakdown Charts - Moved to top */}
      {portfolioData.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <StackedBarChart
            title="Breakdown by Asset"
            data={assetDistribution}
            colors={assetColors}
            formatValue={formatCurrency}
          />
        </div>
      )}

      {/* Performance Charts Section */}
      {performanceData.length > 0 && (
        <div>
          <EnhancedPerformanceCharts data={performanceData} dataSource="personal-portfolio" />
        </div>
      )}

      {/* Portfolio Distribution Cards */}
      {portfolioData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          <LocationDistributionCard
            data={locationDistribution}
            totalValue={totalValue}
            formatValue={formatCurrency}
          />
          <AssetTypeDistributionCard
            data={assetTypeDistribution}
            totalValue={totalValue}
            formatValue={formatCurrency}
          />
          <RiskDistributionCard
            data={detailedRiskDistribution}
            totalValue={totalValue}
            formatValue={formatCurrency}
          />
        </div>
      )}

      {/* No data message */}
      {performanceData.length === 0 && portfolioData.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">No data available</p>
          <p className="text-gray-500 text-sm mt-2">Performance data: {performanceData.length}, Portfolio data: {portfolioData.length}</p>
        </div>
      )}
    </div>
  );
}
