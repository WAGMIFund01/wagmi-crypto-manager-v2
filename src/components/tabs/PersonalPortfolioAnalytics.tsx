'use client';

import { useState, useEffect } from 'react';
import { WagmiSpinner, WagmiButton } from '@/components/ui';
import PersonalPortfolioPerformanceCharts from '@/components/charts/PersonalPortfolioPerformanceCharts';
import { fetchPersonalPortfolioPerformanceData } from '@/services/personalPortfolioPerformanceDataService';
import { PersonalPortfolioPerformanceData } from '@/shared/types/performance';

interface PersonalPortfolioAnalyticsProps {
  onRefresh?: () => void;
  refreshKey?: number;
}

export default function PersonalPortfolioAnalytics({ onRefresh, refreshKey }: PersonalPortfolioAnalyticsProps) {
  const [performanceData, setPerformanceData] = useState<PersonalPortfolioPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when refreshKey changes (triggered by parent)
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      console.log('Personal Portfolio Analytics refresh triggered by refreshKey:', refreshKey);
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
      
      // Fetch personal portfolio performance data from Personal portfolio historical sheet
      const perfData = await fetchPersonalPortfolioPerformanceData();
      setPerformanceData(perfData);
    } catch (err) {
      console.error('Error fetching personal portfolio analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
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

  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Charts Section */}
      {performanceData.length > 0 && (
        <div className="mt-8">
          <PersonalPortfolioPerformanceCharts data={performanceData} />
        </div>
      )}
    </div>
  );
}

