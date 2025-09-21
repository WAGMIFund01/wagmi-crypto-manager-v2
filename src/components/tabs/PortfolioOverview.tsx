'use client';

import React, { useState, useEffect } from 'react';
import { PortfolioAsset } from '@/lib/sheetsAdapter';
import { StackedBarChart, WagmiCard, WagmiSpinner, WagmiText, WagmiButton } from '@/components/ui';
import AssetSearchModal from '@/features/transactions/components/AssetSearchModal';
import AddAssetForm from '@/features/transactions/components/AddAssetForm';
import { AssetSearchResult } from '@/features/transactions/services/AssetSearchService';

interface PortfolioOverviewProps {
  className?: string;
  onRefresh?: () => void;
  isPrivacyMode?: boolean;
}

export default function PortfolioOverview({ className, onRefresh, isPrivacyMode = false }: PortfolioOverviewProps) {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Asset management state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(null);
  const [removingAsset, setRemovingAsset] = useState<string | null>(null);

  const fetchPortfolioData = async () => {
    try {
      console.log('🔄 Fetching portfolio data...');
      setLoading(true);
      setError(null);
      const response = await fetch('/api/get-portfolio-data');
      const data = await response.json();

      console.log('📊 Portfolio data response:', {
        success: data.success,
        assetCount: data.assets?.length || 0,
        assets: data.assets?.map((asset: any) => asset.symbol) || []
      });

      if (data.success) {
        setAssets(data.assets);
        console.log('✅ Portfolio data updated successfully');
      } else {
        setError(data.error || 'Failed to fetch portfolio data');
        console.log('❌ Portfolio data fetch failed:', data.error);
      }
    } catch (err) {
      console.error('❌ Error fetching portfolio data:', err);
      setError('Failed to fetch portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  // Refresh when onRefresh callback changes (triggered by parent)
  useEffect(() => {
    if (onRefresh) {
      fetchPortfolioData();
    }
  }, [onRefresh]);

  // Asset management functions
  const handleAssetSelect = (asset: AssetSearchResult) => {
    setSelectedAsset(asset);
    setShowSearchModal(false);
    setShowAddForm(true);
  };

  const handleAssetAdded = () => {
    setSelectedAsset(null);
    setShowAddForm(false);
    fetchPortfolioData(); // Refresh the portfolio data
  };

  const handleRemoveAsset = async (symbol: string) => {
    console.log('Delete button clicked for symbol:', symbol);
    
    // Prevent multiple simultaneous deletion attempts
    if (removingAsset) {
      console.log('Another deletion is already in progress, ignoring this request');
      return;
    }
    
    if (!confirm(`Are you sure you want to remove ${symbol} from the portfolio?`)) {
      console.log('User cancelled deletion');
      return;
    }

    console.log('User confirmed deletion, starting removal process...');
    setRemovingAsset(symbol);
    try {
      console.log('Making API call to remove asset:', symbol);
      const response = await fetch(`/api/remove-asset?symbol=${encodeURIComponent(symbol)}`, {
        method: 'DELETE',
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);

      if (data.success) {
        console.log('Asset removal successful, refreshing portfolio data');
        fetchPortfolioData(); // Refresh the portfolio data
      } else {
        console.log('Asset removal failed:', data.error);
        const errorMsg = data.error || 'Unknown error occurred';
        
        // Provide more specific error messages
        if (errorMsg.includes('not actually removed')) {
          alert(`Asset deletion verification failed: ${errorMsg}\n\nThis might be due to:\n- Duplicate entries in the sheet\n- Sheet protection settings\n- Google Sheets API permissions`);
        } else {
          alert(`Failed to remove asset: ${errorMsg}`);
        }
      }
    } catch (err) {
      console.error('Error removing asset:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to remove asset: ${errorMsg}`);
    } finally {
      setRemovingAsset(null);
    }
  };

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

  // Create masking dots for privacy mode
  const createMask = () => {
    return '•••••';
  };

  const formatPriceChange = (change?: number) => {
    if (change === undefined || change === null) {
      return { text: 'N/A', color: 'text-gray-400' };
    }
    
    const isPositive = change > 0;
    const isNegative = change < 0;
    const sign = isPositive ? '+' : '';
    
    return {
      text: `${sign}${change.toFixed(2)}%`,
      color: isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
    };
  };

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center min-h-96`}>
        <WagmiSpinner 
          size="lg" 
          theme="green" 
          text="Loading portfolio data..." 
          showText={true} 
          centered={true}
        />
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
      const value = asset[groupBy];
      if (value !== undefined && value !== null) {
        const key = value.toString();
        groups[key] = (groups[key] || 0) + asset.totalValue;
      }
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


  return (
    <div className={`${className} space-y-6`}>
      {/* Add Asset Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
        <WagmiButton
          variant="primary"
          onClick={() => setShowSearchModal(true)}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Asset</span>
        </WagmiButton>
      </div>

      {/* Portfolio Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StackedBarChart
          title="Breakdown by Asset"
          data={assetDistribution}
          colors={assetColors}
          formatValue={formatCurrency}
        />
        <StackedBarChart
          title="Breakdown by Risk"
          data={riskDistribution}
          colors={riskColors}
          formatValue={formatCurrency}
        />
        <StackedBarChart
          title="Breakdown by Location"
          data={locationDistribution}
          colors={locationColors}
          formatValue={formatCurrency}
        />
        <StackedBarChart
          title="Breakdown by Type"
          data={typeDistribution}
          colors={typeColors}
          formatValue={formatCurrency}
        />
      </div>

      {/* Assets Table */}
      <WagmiCard variant="container" theme="green" size="lg" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <WagmiText variant="h4" weight="semibold" color="primary">Portfolio Assets</WagmiText>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="p-4 space-y-4">
            {assets.map((asset, index) => (
              <div key={`${asset.symbol}-${index}`} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                {/* Asset Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-base font-medium text-white">{asset.assetName}</div>
                    <div className="text-sm text-gray-400">{asset.symbol}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-base font-medium text-gray-300">{isPrivacyMode ? createMask() : formatCurrency(asset.totalValue)}</div>
                      <div className="text-sm text-gray-400">{formatCurrency(asset.currentPrice)}</div>
                      <div className={`text-xs font-medium ${formatPriceChange(asset.priceChange24h).color}`}>
                        {formatPriceChange(asset.priceChange24h).text}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAsset(asset.symbol)}
                      disabled={removingAsset === asset.symbol}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove asset"
                    >
                      {removingAsset === asset.symbol ? (
                        <WagmiSpinner size="sm" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Asset Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wide">Chain</div>
                    <div className={`font-medium ${getChainColor(asset.chain)}`}>{asset.chain}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wide">Risk</div>
                    <div className={`font-medium ${getRiskColor(asset.riskLevel)}`}>{asset.riskLevel}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wide">Location</div>
                    <div className="text-gray-300">{asset.location}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wide">Type</div>
                    <div className="text-gray-300">{asset.coinType}</div>
                  </div>
                </div>
                
                {/* Quantity */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Quantity</div>
                  <div className="text-sm text-gray-300">{isPrivacyMode ? createMask() : formatNumber(asset.quantity)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <WagmiText variant="label" color="muted">Asset</WagmiText>
                </th>
                <th className="px-6 py-3 text-left">
                  <WagmiText variant="label" color="muted">Chain</WagmiText>
                </th>
                <th className="px-6 py-3 text-left">
                  <WagmiText variant="label" color="muted">Risk</WagmiText>
                </th>
                <th className="px-6 py-3 text-left">
                  <WagmiText variant="label" color="muted">Location</WagmiText>
                </th>
                <th className="px-6 py-3 text-left">
                  <WagmiText variant="label" color="muted">Type</WagmiText>
                </th>
                <th className="px-6 py-3 text-right">
                  <WagmiText variant="label" color="muted">Quantity</WagmiText>
                </th>
                <th className="px-6 py-3 text-right">
                  <WagmiText variant="label" color="muted">Price</WagmiText>
                </th>
                <th className="px-6 py-3 text-right">
                  <WagmiText variant="label" color="muted">24h Change</WagmiText>
                </th>
                <th className="px-6 py-3 text-right">
                  <WagmiText variant="label" color="muted">Value</WagmiText>
                </th>
                <th className="px-6 py-3 text-center">
                  <WagmiText variant="label" color="muted">Actions</WagmiText>
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
                    <div className="text-sm text-gray-300">{isPrivacyMode ? createMask() : formatNumber(asset.quantity)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-300">{formatCurrency(asset.currentPrice)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${formatPriceChange(asset.priceChange24h).color}`}>
                      {formatPriceChange(asset.priceChange24h).text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-300">{isPrivacyMode ? createMask() : formatCurrency(asset.totalValue)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleRemoveAsset(asset.symbol)}
                      disabled={removingAsset === asset.symbol}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove asset"
                    >
                      {removingAsset === asset.symbol ? (
                        <WagmiSpinner size="sm" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </WagmiCard>

      {/* Asset Management Modals */}
      <AssetSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onAssetSelect={handleAssetSelect}
      />

      <AddAssetForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAssetAdded={handleAssetAdded}
        selectedAsset={selectedAsset}
      />
    </div>
  );
}