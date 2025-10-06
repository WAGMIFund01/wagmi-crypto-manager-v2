'use client';

import { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WagmiButton, WagmiCard } from '@/components/ui';
import { getSpacing, getStandardCardStyle } from '@/shared/utils/standardization';
import { ChartExporter, ChartData } from '@/lib/chartExport';

interface PerformanceData {
  month: string;
  endingAUM: number;
  wagmiMoM: number;
  totalMoM: number;
  total3MoM: number;
  wagmiCumulative: number;
  totalCumulative: number;
  total3Cumulative: number;
}

interface PersonalPortfolioPerformanceData {
  month: string;
  endingAUM: number;
  personalMoM: number;
  totalMoM: number;
  total3MoM: number;
  personalCumulative: number;
  totalCumulative: number;
  total3Cumulative: number;
  investment: number;
}

interface EnhancedPerformanceChartsProps {
  data: PerformanceData[] | PersonalPortfolioPerformanceData[];
  dataSource?: 'wagmi-fund' | 'personal-portfolio';
  hideAumSelector?: boolean;
  customTitle?: string;
}

type DurationFilter = '6M' | '1Y' | 'All';
type ChartMode = 'aum' | 'mom' | 'cumulative' | 'investment';

export default function EnhancedPerformanceCharts({ 
  data, 
  dataSource = 'wagmi-fund',
  hideAumSelector = false,
  customTitle
}: EnhancedPerformanceChartsProps) {
  const [chartMode, setChartMode] = useState<ChartMode>(hideAumSelector ? 'mom' : 'aum');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('All');
  
  // Ref for export functionality
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Filter out future months - only show current and historical data
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based month (0-11)
  
  // Month name mapping for parsing
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Apply duration filter to data
  const filteredData = useMemo(() => {
    // First filter out future months - be very strict about this
    const historicalData = data.filter(item => {
      const [monthName, yearStr] = item.month.split('-');
      const itemYear = parseInt(yearStr);
      const itemMonthIndex = monthNames.indexOf(monthName);
      
      // Only include months that are current or in the past
      if (itemYear < currentYear) {
        return true; // Past years are always included
      } else if (itemYear === currentYear) {
        return itemMonthIndex <= currentMonth; // Only include current month or earlier
      } else {
        return false; // Future years are excluded
      }
    });

    // Then apply duration filter
    if (durationFilter === 'All') {
      return historicalData;
    }

    const monthsToShow = durationFilter === '6M' ? 6 : 12;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToShow);

    return historicalData.filter(item => {
      const [monthName, yearStr] = item.month.split('-');
      const itemDate = new Date(`${monthName} 1, ${yearStr}`);
      return itemDate >= cutoffDate;
    });
  }, [data, durationFilter, currentYear, currentMonth]);

  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage for tooltips
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Enhanced tooltip for bar chart with MoM performance
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      
      // Find the corresponding data point to get MoM performance
      const dataPoint = filteredData.find(item => item.month === label);
      const momPerformance = dataPoint ? (
        dataSource === 'personal-portfolio' 
          ? (dataPoint as PersonalPortfolioPerformanceData).personalMoM 
          : (dataPoint as PerformanceData).wagmiMoM
      ) : 0;
      
      // Determine the title based on chart mode
      const title = chartMode === 'investment' ? 'Net Investment' : 'Ending AUM';
      
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg min-w-[200px]">
          <p className="text-white font-medium mb-2 text-sm">{label}</p>
          <div className="space-y-1">
            <p className="text-green-400 font-semibold">
              {title}: {formatCurrency(value)}
            </p>
            <p className="text-gray-300 text-xs">
              MoM Performance: {momPerformance >= 0 ? '+' : ''}{momPerformance.toFixed(2)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced tooltip for comparison charts with trend indicators
  const CustomComparisonTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg min-w-[250px]">
          <p className="text-white font-medium mb-3 text-sm">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              const isPositive = entry.value >= 0;
              const trendIcon = isPositive ? '📈' : '📉';
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span style={{ color: entry.color }} className="w-3 h-3 rounded-full"></span>
                    <span className="text-gray-300 text-sm">{entry.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs">{trendIcon}</span>
                    <span style={{ color: entry.color }} className="font-semibold text-sm">
                      {formatPercentage(entry.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get the appropriate data keys based on chart mode and data source
  const getDataKeys = () => {
    const isPersonalPortfolio = dataSource === 'personal-portfolio';
    
    if (chartMode === 'aum') {
      return {
        primary: 'endingAUM',
        total: 'endingAUM',
        total3: 'endingAUM',
        primaryName: isPersonalPortfolio ? 'Personal Portfolio AUM' : 'WAGMI Fund AUM',
        totalName: 'Total AUM',
        total3Name: 'Total AUM',
        formatValue: formatCurrency
      };
    } else if (chartMode === 'mom') {
      return {
        primary: isPersonalPortfolio ? 'personalMoM' : 'wagmiMoM',
        total: 'totalMoM',
        total3: 'total3MoM',
        primaryName: isPersonalPortfolio ? 'Personal Portfolio' : 'WAGMI Fund MoM',
        totalName: 'Total Benchmark (Total Crypto)',
        total3Name: 'Total 3 Benchmark (Total Crypto ex BTC, ETH)',
        formatValue: formatPercentage
      };
    } else if (chartMode === 'investment') {
      return {
        primary: 'investment',
        total: 'investment',
        total3: 'investment',
        primaryName: 'Personal Portfolio Net Investment',
        totalName: 'Net Investment',
        total3Name: 'Net Investment',
        formatValue: formatCurrency
      };
    } else {
      return {
        primary: isPersonalPortfolio ? 'personalCumulative' : 'wagmiCumulative',
        total: 'totalCumulative',
        total3: 'total3Cumulative',
        primaryName: isPersonalPortfolio ? 'Personal Portfolio' : 'WAGMI Fund Cumulative',
        totalName: 'Total Benchmark (Total Crypto)',
        total3Name: 'Total 3 Benchmark (Total Crypto ex BTC, ETH)',
        formatValue: formatPercentage
      };
    }
  };

  const dataKeys = getDataKeys();

  // Get chart title
  const getChartTitle = () => {
    return customTitle || 'Historical Performance';
  };

  // Get time period text for export
  const getTimePeriodText = () => {
    switch (durationFilter) {
      case '6M': return 'Last 6 Months';
      case '1Y': return 'Last 12 Months';
      case 'All': return 'All Time';
      default: return 'All Time';
    }
  };

  // Export handlers
  const handleExportPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      const filename = ChartExporter.getExportFilename(
        dataSource === 'personal-portfolio' ? 'personal-portfolio-chart' : 'wagmi-fund-chart',
        'png'
      );
      await ChartExporter.exportAsPNG(chartRef.current, { 
        filename,
        title: getChartTitle(),
        timePeriod: getTimePeriodText(),
        dataSource
      });
    } catch (error) {
      console.error('Export PNG failed:', error);
    }
  };

  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    
    try {
      const filename = ChartExporter.getExportFilename(
        dataSource === 'personal-portfolio' ? 'personal-portfolio-chart' : 'wagmi-fund-chart',
        'pdf'
      );
      await ChartExporter.exportAsPDF(chartRef.current, { 
        filename,
        title: getChartTitle(),
        timePeriod: getTimePeriodText(),
        dataSource
      });
    } catch (error) {
      console.error('Export PDF failed:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      const filename = ChartExporter.getExportFilename(
        dataSource === 'personal-portfolio' ? 'personal-portfolio-data' : 'wagmi-fund-data',
        'csv'
      );
      ChartExporter.exportAsCSV(filteredData as ChartData[], { filename });
    } catch (error) {
      console.error('Export CSV failed:', error);
    }
  };


  return (
    <div className={`${getSpacing('xl')}`}>
      {/* Consolidated Chart: Historical Performance */}
      <WagmiCard variant="default" theme="green" size="lg">
        <div className="p-4 md:p-6" ref={chartRef}>
          <div className="flex flex-col space-y-3 mb-4">
            <h3 className="text-lg font-semibold text-white">{getChartTitle()}</h3>
            
            {/* Chart Mode Selector Buttons - Mobile Optimized */}
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
              {!hideAumSelector && (
                <WagmiButton
                  onClick={() => setChartMode('aum')}
                  variant={chartMode === 'aum' ? 'primary' : 'outline'}
                  theme="green"
                  size="sm"
                  className="flex-shrink-0 min-w-[120px] touch-manipulation"
                >
                  Historical AUM
                </WagmiButton>
              )}
              <WagmiButton
                onClick={() => setChartMode('mom')}
                variant={chartMode === 'mom' ? 'primary' : 'outline'}
                theme="green"
                size="sm"
                className="flex-shrink-0 min-w-[120px] touch-manipulation"
              >
                MoM Return
              </WagmiButton>
              <WagmiButton
                onClick={() => setChartMode('cumulative')}
                variant={chartMode === 'cumulative' ? 'primary' : 'outline'}
                theme="green"
                size="sm"
                className="flex-shrink-0 min-w-[140px] touch-manipulation"
              >
                Cumulative Return
              </WagmiButton>
              {dataSource === 'personal-portfolio' && (
                <WagmiButton
                  onClick={() => setChartMode('investment')}
                  variant={chartMode === 'investment' ? 'primary' : 'outline'}
                  theme="green"
                  size="sm"
                  className="flex-shrink-0 min-w-[120px] touch-manipulation"
                >
                  Net Investment
                </WagmiButton>
              )}
            </div>
            
            {/* Duration Filter Buttons - Mobile Optimized */}
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
              <WagmiButton
                onClick={() => setDurationFilter('6M')}
                variant={durationFilter === '6M' ? 'primary' : 'outline'}
                theme="green"
                size="sm"
                className="flex-shrink-0 min-w-[60px] touch-manipulation"
              >
                6M
              </WagmiButton>
              <WagmiButton
                onClick={() => setDurationFilter('1Y')}
                variant={durationFilter === '1Y' ? 'primary' : 'outline'}
                theme="green"
                size="sm"
                className="flex-shrink-0 min-w-[60px] touch-manipulation"
              >
                1Y
              </WagmiButton>
              <WagmiButton
                onClick={() => setDurationFilter('All')}
                variant={durationFilter === 'All' ? 'primary' : 'outline'}
                theme="green"
                size="sm"
                className="flex-shrink-0 min-w-[60px] touch-manipulation"
              >
                All
              </WagmiButton>
            </div>
            
            {/* Export Buttons */}
            <div className="flex gap-2 flex-wrap">
              <WagmiButton
                onClick={handleExportPNG}
                variant="outline"
                theme="green"
                size="sm"
                className="text-xs"
              >
                📊 PNG
              </WagmiButton>
              <WagmiButton
                onClick={handleExportPDF}
                variant="outline"
                theme="green"
                size="sm"
                className="text-xs"
              >
                📄 PDF
              </WagmiButton>
              <WagmiButton
                onClick={handleExportCSV}
                variant="outline"
                theme="green"
                size="sm"
                className="text-xs"
              >
                📈 CSV
              </WagmiButton>
            </div>
          </div>
          
          <div className="h-64 sm:h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={filteredData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                className="mobile-chart"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={chartMode === 'aum' || chartMode === 'investment' ? (value) => `$${(value / 1000).toFixed(0)}K` : (value) => `${value.toFixed(1)}%`}
                />
                <Tooltip content={chartMode === 'aum' || chartMode === 'investment' ? <CustomBarTooltip /> : <CustomComparisonTooltip />} />
                {chartMode === 'aum' ? (
                  <Bar 
                    dataKey="endingAUM" 
                    fill="#00FF95"
                    name="Ending AUM"
                    radius={[4, 4, 0, 0]}
                  />
                ) : chartMode === 'investment' ? (
                  <Bar 
                    dataKey="investment" 
                    fill="#00FF95"
                    name="Net Investment"
                    radius={[4, 4, 0, 0]}
                  />
                ) : (
                  <>
                    <Legend 
                      wrapperStyle={{ fontSize: '8px' }}
                      iconType="rect"
                      style={{ fontSize: '8px' }}
                    />
                    <Bar 
                      dataKey={dataKeys.primary} 
                      fill="#00FF95"
                      name={dataKeys.primaryName}
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey={dataKeys.total} 
                      fill="#3B82F6"
                      name={dataKeys.totalName}
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey={dataKeys.total3} 
                      fill="#F59E0B"
                      name={dataKeys.total3Name}
                      radius={[2, 2, 0, 0]}
                    />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </WagmiCard>
    </div>
  );
}
