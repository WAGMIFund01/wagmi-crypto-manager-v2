'use client';

import React, { useState, useEffect } from 'react';
import { PortfolioAsset } from '@/app/api/get-portfolio-data/route';

interface PortfolioOverviewProps {
  className?: string;
}

export default function PortfolioOverview({ className }: PortfolioOverviewProps) {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/get-portfolio-data');
        const data = await response.json();

        if (data.success) {
          setAssets(data.assets);
        } else {
          setError(data.error || 'Failed to fetch portfolio data');
        }
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError('Failed to fetch portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 4) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      case 'degen':
        return 'text-purple-400';
      case 'none':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getChainColor = (chain: string) => {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return 'text-blue-400';
      case 'solana':
        return 'text-purple-400';
      case 'hyperliquid':
        return 'text-cyan-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center min-h-96`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF95] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center min-h-96`}>
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-red-400 mb-2">Error loading portfolio data</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);

  // Calculate distributions for charts
  const calculateDistribution = (groupBy: keyof PortfolioAsset) => {
    const groups: { [key: string]: number } = {};
    assets.forEach(asset => {
      const key = asset[groupBy].toString();
      groups[key] = (groups[key] || 0) + asset.totalValue;
    });
    return groups;
  };

  const assetDistribution = calculateDistribution('assetName');
  const riskDistribution = calculateDistribution('riskLevel');
  const locationDistribution = calculateDistribution('location');
  const typeDistribution = calculateDistribution('coinType');

  // Color palettes for different chart types
  const assetColors = [
    '#00FF95', '#FF6B35', '#3B82F6', '#8B5CF6', '#F59E0B', 
    '#EF4444', '#10B981', '#F97316', '#6366F1', '#EC4899'
  ];
  
  const riskColors = {
    'High': '#EF4444',
    'Medium': '#F59E0B', 
    'Low': '#10B981',
    'Degen': '#8B5CF6',
    'None': '#6B7280'
  };

  const locationColors = [
    '#00FF95', '#FF6B35', '#3B82F6', '#8B5CF6', '#F59E0B',
    '#EF4444', '#10B981', '#F97316', '#6366F1', '#EC4899'
  ];

  const typeColors = {
    'Memecoin': '#8B5CF6',
    'Major': '#00FF95',
    'Altcoin': '#3B82F6',
    'Stablecoin': '#6B7280'
  };

  const renderStackedBarChart = (
    title: string,
    data: { [key: string]: number },
    colors: { [key: string]: string } | string[],
    maxItems: number = 10
  ) => {
    const sortedEntries = Object.entries(data)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxItems);
    
    const total = sortedEntries.reduce((sum, [, value]) => sum + value, 0);
    
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
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
                  title={`${key}: ${formatCurrency(value)} (${percentage.toFixed(1)}%)`}
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
      </div>
    );
  };

  return (
    <div className={`${className} space-y-6`}>
      {/* Portfolio Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderStackedBarChart('Distribution by Asset', assetDistribution, assetColors)}
        {renderStackedBarChart('Distribution by Risk', riskDistribution, riskColors)}
        {renderStackedBarChart('Distribution by Location', locationDistribution, locationColors)}
        {renderStackedBarChart('Distribution by Type', typeDistribution, typeColors)}
      </div>

      {/* Assets Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Portfolio Assets</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Chain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {assets.map((asset, index) => (
                <tr key={`${asset.symbol}-${index}`} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{asset.assetName}</div>
                      <div className="text-sm text-gray-400">{asset.symbol}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getChainColor(asset.chain)}`}>
                      {asset.chain}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getRiskColor(asset.riskLevel)}`}>
                      {asset.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{asset.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                      {asset.coinType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-300">{formatNumber(asset.quantity)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-300">{formatCurrency(asset.currentPrice)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-[#00FF95]">{formatCurrency(asset.totalValue)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}