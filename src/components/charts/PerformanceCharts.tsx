'use client';

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  // Custom tooltip for line charts
  const CustomLineTooltip = ({ active, payload, label }: any) => {
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

  return (
    <div className="space-y-8">
      {/* Chart 1: Bar Chart - Historical Fund Performance (Ending AUM) */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Historical Fund Performance (Ending AUM)</h3>
        <div className="h-80">
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

      {/* Chart 2: Line Chart - MoM Performance Comparison */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Month-over-Month Performance Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              <Tooltip content={<CustomLineTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="wagmiMoM" 
                stroke="#00FF95" 
                strokeWidth={3}
                name="WAGMI Fund"
                dot={{ fill: '#00FF95', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalMoM" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Total Benchmark"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="total3MoM" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Total 3 Benchmark"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Line Chart - Cumulative Return Comparison */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cumulative Return Comparison (Indexed to 1)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="wagmiCumulative" 
                stroke="#00FF95" 
                strokeWidth={3}
                name="WAGMI Fund"
                dot={{ fill: '#00FF95', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalCumulative" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Total Benchmark"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="total3Cumulative" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Total 3 Benchmark"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
