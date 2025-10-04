'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WagmiButton, WagmiCard } from '@/components/ui';
import { getStandardCardStyle } from '@/shared/utils/standardization';
import { PersonalPortfolioPerformanceData } from '@/shared/types/performance';

interface PersonalPortfolioPerformanceChartsProps {
  data: PersonalPortfolioPerformanceData[];
}

export default function PersonalPortfolioPerformanceCharts({ data }: PersonalPortfolioPerformanceChartsProps) {
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
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatPercentage(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Determine data keys and names based on view mode
  const dataKeys = viewMode === 'mom' 
    ? {
        personal: 'personalMoM',
        total: 'totalMoM',
        total3: 'total3MoM',
        personalName: 'Personal Portfolio',
        totalName: 'Total Benchmark',
        total3Name: 'Total 3 Benchmark'
      }
    : {
        personal: 'personalCumulative',
        total: 'totalCumulative',
        total3: 'total3Cumulative',
        personalName: 'Personal Portfolio',
        totalName: 'Total Benchmark',
        total3Name: 'Total 3 Benchmark'
      };

  return (
    <div className="space-y-6">
      {/* Historical Performance Chart */}
      <WagmiCard className={getStandardCardStyle()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">
              Personal Portfolio Historical Performance
            </h3>
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
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend />
                <Bar 
                  dataKey="endingAUM" 
                  fill="#00FF95"
                  name="Ending AUM"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </WagmiCard>

      {/* Performance vs Benchmarks Chart */}
      <WagmiCard className={getStandardCardStyle()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">
              Performance vs Benchmarks
            </h3>
            <div className="flex gap-2">
              <WagmiButton
                onClick={() => setViewMode('mom')}
                variant={viewMode === 'mom' ? 'primary' : 'outline'}
                theme="green"
                size="sm"
              >
                MoM Return
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
                  dataKey={dataKeys.personal} 
                  fill="#00FF95"
                  name={dataKeys.personalName}
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
