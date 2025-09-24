'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WagmiButton, WagmiCard } from '@/components/ui';
import { getSpacing, getStandardCardStyle } from '@/shared/utils/standardization';

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

interface PerformanceChartsProps {
  data: PerformanceData[];
}

export default function PerformanceCharts({ data }: PerformanceChartsProps) {
  const [viewMode, setViewMode] = useState<'mom' | 'cumulative'>('mom');
  
  // Filter out future months - only show current and historical data
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const filteredData = data.filter(item => {
    const [month, year] = item.month.split('-');
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const itemYear = parseInt(year);
    
    // Only include months that are current or in the past
    return itemYear < currentYear || (itemYear === currentYear && monthIndex <= currentMonth);
  });

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

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          <p className="text-green-400">
            Ending AUM: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for comparison charts
  const CustomComparisonTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatPercentage(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get the appropriate data keys based on view mode
  const getDataKeys = () => {
    if (viewMode === 'mom') {
      return {
        wagmi: 'wagmiMoM',
        total: 'totalMoM',
        total3: 'total3MoM',
        wagmiName: 'WAGMI Fund',
        totalName: 'Total Benchmark',
        total3Name: 'Total 3 Benchmark'
      };
    } else {
      return {
        wagmi: 'wagmiCumulative',
        total: 'totalCumulative',
        total3: 'total3Cumulative',
        wagmiName: 'WAGMI Fund',
        totalName: 'Total Benchmark',
        total3Name: 'Total 3 Benchmark'
      };
    }
  };

  const dataKeys = getDataKeys();

  return (
    <div className={getSpacing('xl')}>
      {/* Chart 1: Bar Chart - Historical Fund Performance (Ending AUM) */}
      <WagmiCard variant="default" theme="green" size="lg">
        <div className="p-4 md:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Historical Fund Performance (Ending AUM)</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar 
                dataKey="endingAUM" 
                fill="#00FF95"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>
      </WagmiCard>

      {/* Chart 2: Toggleable Performance vs Benchmarks */}
      <WagmiCard variant="default" theme="green" size="lg">
        <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-white">Performance vs Benchmarks</h3>
          
          {/* Toggle Buttons */}
          <div className="flex bg-gray-700 rounded-lg p-1 w-full sm:w-auto">
            <WagmiButton
              onClick={() => setViewMode('mom')}
              variant={viewMode === 'mom' ? 'primary' : 'outline'}
              theme="green"
              size="sm"
            >
              MoM Performance
            </WagmiButton>
            <WagmiButton
              onClick={() => setViewMode('cumulative')}
              variant={viewMode === 'cumulative' ? 'primary' : 'outline'}
              theme="green"
              size="sm"
            >
              Cumulative Return
            </WagmiButton>
          </div>
        </div>
        
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip content={<CustomComparisonTooltip />} />
              <Legend />
              <Bar 
                dataKey={dataKeys.wagmi} 
                fill="#00FF95"
                name={dataKeys.wagmiName}
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
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>
      </WagmiCard>
    </div>
  );
}
