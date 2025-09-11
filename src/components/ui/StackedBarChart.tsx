'use client';

import React from 'react';
import WagmiCard from './WagmiCard';

interface StackedBarChartProps {
  title: string;
  data: { [key: string]: number };
  colors: { [key: string]: string } | string[];
  maxItems?: number;
  className?: string;
  formatValue?: (value: number) => string;
}

export default function StackedBarChart({
  title,
  data,
  colors,
  maxItems = 10,
  className = '',
  formatValue = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}: StackedBarChartProps) {
  const sortedEntries = Object.entries(data)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxItems);
  
  const total = sortedEntries.reduce((sum, [, value]) => sum + value, 0);
  
  return (
    <WagmiCard 
      variant="kpi" 
      theme="green" 
      size="md" 
      className={className}
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {/* Stacked Bar */}
        <div className="h-8 bg-gray-700 rounded-lg overflow-hidden flex">
          {sortedEntries.map(([key, value], index) => {
            const percentage = (value / total) * 100;
            const color = Array.isArray(colors) ? colors[index % colors.length] : colors[key];
            return (
              <div
                key={key}
                className="h-full transition-all duration-300 hover:opacity-80"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
                title={`${key}: ${formatValue(value)} (${percentage.toFixed(1)}%)`}
              />
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {sortedEntries.map(([key, value], index) => {
            const percentage = (value / total) * 100;
            const color = Array.isArray(colors) ? colors[index % colors.length] : colors[key];
            return (
              <div key={key} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0">
                  <div className="text-gray-300 truncate" title={key}>{key}</div>
                  <div className="text-gray-400">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WagmiCard>
  );
}
