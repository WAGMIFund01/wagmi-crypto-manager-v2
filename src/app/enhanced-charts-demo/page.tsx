'use client';

import { useState, useEffect } from 'react';
import { WagmiSpinner, WagmiButton, WagmiCard } from '@/components/ui';
import EnhancedPerformanceCharts from '@/components/charts/EnhancedPerformanceCharts';
import { fetchPerformanceData, PerformanceData } from '@/services/performanceDataService';
import { fetchPersonalPortfolioPerformanceData } from '@/services/personalPortfolioPerformanceDataService';
import { PersonalPortfolioPerformanceData } from '@/shared/types/performance';

type DataSource = 'wagmi-fund' | 'personal-portfolio';

export default function EnhancedChartsDemo() {
  const [dataSource, setDataSource] = useState<DataSource>('wagmi-fund');
  const [wagmiData, setWagmiData] = useState<PerformanceData[]>([]);
  const [personalData, setPersonalData] = useState<PersonalPortfolioPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both datasets in parallel
      const [wagmiPerfData, personalPerfData] = await Promise.all([
        fetchPerformanceData(),
        fetchPersonalPortfolioPerformanceData()
      ]);
      
      setWagmiData(wagmiPerfData);
      setPersonalData(personalPerfData);
    } catch (err) {
      console.error('Error fetching demo data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleDataSourceChange = (newDataSource: DataSource) => {
    setDataSource(newDataSource);
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <WagmiSpinner size="lg" />
              <p className="text-gray-400 mt-4">Loading enhanced charts demo...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <p className="text-red-400 mb-4">Error loading demo data</p>
              <p className="text-gray-400 mb-6">{error}</p>
              <WagmiButton onClick={handleRefresh} theme="red" variant="primary">
                Try Again
              </WagmiButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentData = dataSource === 'wagmi-fund' ? wagmiData : personalData;
  const dataCount = currentData.length;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Enhanced Performance Charts Demo
          </h1>
          <p className="text-gray-400 mb-6">
            Showcasing the new duration toggle functionality and enhanced features
          </p>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <WagmiButton
                onClick={() => handleDataSourceChange('wagmi-fund')}
                variant={dataSource === 'wagmi-fund' ? 'primary' : 'outline'}
                theme="green"
              >
                WAGMI Fund
              </WagmiButton>
              <WagmiButton
                onClick={() => handleDataSourceChange('personal-portfolio')}
                variant={dataSource === 'personal-portfolio' ? 'primary' : 'outline'}
                theme="blue"
              >
                Personal Portfolio
              </WagmiButton>
            </div>
            
            <div className="flex gap-2">
              <WagmiButton
                onClick={handleRefresh}
                variant="outline"
                theme="gray"
              >
                Refresh Data
              </WagmiButton>
            </div>
          </div>
        </div>

        {/* Data Info Card */}
        <WagmiCard variant="default" theme="gray" size="md" className="mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Data Source Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Current Source:</span>
                <p className="text-white font-medium">
                  {dataSource === 'wagmi-fund' ? 'WAGMI Fund Performance' : 'Personal Portfolio Performance'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Data Points:</span>
                <p className="text-white font-medium">{dataCount} months</p>
              </div>
              <div>
                <span className="text-gray-400">Last Updated:</span>
                <p className="text-white font-medium">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </WagmiCard>

        {/* Enhanced Charts */}
        <EnhancedPerformanceCharts 
          data={currentData} 
          dataSource={dataSource}
        />

        {/* Feature Showcase */}
        <WagmiCard variant="default" theme="green" size="lg" className="mt-8">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">New Features Showcase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="text-green-400 font-medium">Duration Toggle</h4>
                <p className="text-gray-300 text-sm">
                  Filter charts to show last 6 months, 1 year, or all time data
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-green-400 font-medium">Enhanced Tooltips</h4>
                <p className="text-gray-300 text-sm">
                  More informative tooltips with trend indicators and additional context
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-green-400 font-medium">Module Support</h4>
                <p className="text-gray-300 text-sm">
                  Seamlessly handles both WAGMI Fund and Personal Portfolio data
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-green-400 font-medium">Mobile Optimized</h4>
                <p className="text-gray-300 text-sm">
                  Touch-friendly interactions and responsive design for all devices
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-green-400 font-medium">Performance</h4>
                <p className="text-gray-300 text-sm">
                  Optimized rendering with useMemo for efficient data filtering
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-green-400 font-medium">Accessibility</h4>
                <p className="text-gray-300 text-sm">
                  Full keyboard navigation and screen reader support
                </p>
              </div>
            </div>
          </div>
        </WagmiCard>

        {/* Testing Instructions */}
        <WagmiCard variant="default" theme="blue" size="lg" className="mt-6">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Testing Instructions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-blue-400 font-medium mb-2">Duration Filters</h4>
                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                  <li>• Click &quot;6M&quot; to show last 6 months of data</li>
                  <li>• Click &quot;1Y&quot; to show last 12 months of data</li>
                  <li>• Click &quot;All&quot; to show all available data</li>
                  <li>• Notice how the chart title updates dynamically</li>
                </ul>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-2">View Modes</h4>
                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                  <li>• Toggle between &quot;MoM Performance&quot; and &quot;Cumulative Return&quot;</li>
                  <li>• Notice the different data keys used for each mode</li>
                  <li>• Button text changes based on data source (WAGMI vs Personal)</li>
                </ul>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-2">Data Source Switching</h4>
                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                  <li>• Switch between &quot;WAGMI Fund&quot; and &quot;Personal Portfolio&quot;</li>
                  <li>• Notice how chart titles and button text adapt</li>
                  <li>• Different data structures are handled seamlessly</li>
                </ul>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-2">Mobile Testing</h4>
                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                  <li>• Test on mobile devices or use browser dev tools</li>
                  <li>• Try touch interactions on the charts</li>
                  <li>• Verify responsive layout and button accessibility</li>
                </ul>
              </div>
            </div>
          </div>
        </WagmiCard>
      </div>
    </div>
  );
}
