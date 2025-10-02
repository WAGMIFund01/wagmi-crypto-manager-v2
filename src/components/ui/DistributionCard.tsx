'use client';

import React from 'react';
import { WagmiCard } from '@/components/ui';
import { COLORS } from '@/shared/constants/colors';

interface DistributionItem {
  label: string;
  value: number;
  percentage: number;
  color?: string;
}

interface DistributionCardProps {
  title: string;
  data: Record<string, number>;
  totalValue: number;
  colorMap?: Record<string, string>;
  formatValue?: (value: number) => string;
  className?: string;
}

export default function DistributionCard({
  title,
  data,
  totalValue,
  colorMap = {},
  formatValue = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value),
  className = ''
}: DistributionCardProps) {
  // Convert data to array and sort by value (descending)
  const distributionItems: DistributionItem[] = Object.entries(data)
    .map(([label, value]) => ({
      label,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      color: colorMap[label.toLowerCase()] || '#6B7280'
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <WagmiCard variant="default" theme="green" size="lg" className={className}>
      <div className="p-4 md:p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="space-y-3">
          {distributionItems.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 truncate">{item.label}</span>
                <span className="text-white font-medium flex-shrink-0 ml-2">
                  {formatValue(item.value)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
              <div className="text-xs text-gray-400">{item.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </WagmiCard>
  );
}

// Pre-configured distribution card variants
export const RiskDistributionCard: React.FC<{
  data: Record<string, number>;
  totalValue: number;
  formatValue?: (value: number) => string;
  className?: string;
}> = ({ data, totalValue, formatValue, className }) => (
  <DistributionCard
    title="Risk Distribution"
    data={data}
    totalValue={totalValue}
    colorMap={COLORS.risk}
    formatValue={formatValue}
    className={className}
  />
);

export const LocationDistributionCard: React.FC<{
  data: Record<string, number>;
  totalValue: number;
  formatValue?: (value: number) => string;
  className?: string;
}> = ({ data, totalValue, formatValue, className }) => (
  <DistributionCard
    title="Location Distribution"
    data={data}
    totalValue={totalValue}
    colorMap={COLORS.location}
    formatValue={formatValue}
    className={className}
  />
);

export const AssetTypeDistributionCard: React.FC<{
  data: Record<string, number>;
  totalValue: number;
  formatValue?: (value: number) => string;
  className?: string;
}> = ({ data, totalValue, formatValue, className }) => (
  <DistributionCard
    title="Asset Type Distribution"
    data={data}
    totalValue={totalValue}
    colorMap={COLORS.assetType}
    formatValue={formatValue}
    className={className}
  />
);
