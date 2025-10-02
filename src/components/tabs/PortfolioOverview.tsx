'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PortfolioAsset } from '@/lib/sheetsAdapter';
import { StackedBarChart, WagmiCard, WagmiSpinner, WagmiText, WagmiButton, RiskDistributionCard, LocationDistributionCard, AssetTypeDistributionCard, DistributionCardSkeleton, ChartSkeleton, Skeleton } from '@/components/ui';
import SortableHeader from '@/components/ui/SortableHeader';
import AssetSearchModal from '@/features/transactions/components/AssetSearchModal';
import AddAssetForm from '@/features/transactions/components/AddAssetForm';
import EditAssetForm from '@/features/transactions/components/EditAssetForm';
import { AssetSearchResult } from '@/features/transactions/services/AssetSearchService';
import { sortData, createSortHandler, SortConfig } from '@/shared/utils/sorting';
import { COLORS, getRiskColor, getAssetTypeColor, getChainColor } from '@/shared/constants/colors';

interface PortfolioOverviewProps {
  className?: string;
  onRefresh?: () => void;
  isPrivacyMode?: boolean;
  dataSource?: 'wagmi-fund' | 'personal-portfolio' | 'performance-dashboard';
}

export default function PortfolioOverview({ className, onRefresh, isPrivacyMode = false, dataSource = 'wagmi-fund' }: PortfolioOverviewProps) {

  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Asset management state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(null);
  const [removingAsset, setRemovingAsset] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<PortfolioAsset | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  
  // Sorting logic
  const sortedAssets = useMemo(() => {
    return sortData(assets, sortConfig);
  }, [assets, sortConfig]);
  
  const handleSort = createSortHandler(sortConfig, setSortConfig);

  const fetchPortfolioData = async () => {
    try {
      console.log('🔄 Fetching portfolio data...');
      setLoading(true);
      setError(null);
      
      // Use the correct API endpoint based on dataSource
      const apiEndpoint = dataSource === 'personal-portfolio' 
        ? '/api/get-personal-portfolio-data' 
        : '/api/get-portfolio-data';
      
      const response = await fetch(apiEndpoint);
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
    // Trigger full refresh including KPI data (AUM ribbon)
    if (onRefresh) {
      onRefresh();
    } else {
      fetchPortfolioData(); // Fallback to local refresh
    }
  };

  const handleEditAsset = (asset: PortfolioAsset) => {
    console.log('Edit button clicked for asset:', asset.symbol);
    setEditingAsset(asset);
    setShowEditForm(true);
  };

  const handleAssetEdited = () => {
    setEditingAsset(null);
    setShowEditForm(false);
    // Trigger full refresh including KPI data (AUM ribbon)
    if (onRefresh) {
      onRefresh();
    } else {
      fetchPortfolioData(); // Fallback to local refresh
    }
  };

  const handleEditAssetSave = async (editData: {
    symbol: string;
    quantity: number;
    riskLevel: string;
    location: string;
    coinType: string;
    thesis: string;
    originalAsset: PortfolioAsset;
  }) => {
    try {
      console.log('=== PortfolioOverview: handleEditAssetSave called ===');
      console.log('Edit data received:', editData);
      
      const response = await fetch('/api/edit-asset', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editData,
          originalAsset: editData.originalAsset,
          dataSource: dataSource
        }),
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);

      if (data.success) {
        console.log('Asset updated successfully, calling handleAssetEdited');
        handleAssetEdited();
      } else {
        console.error('API returned error:', data.error);
        throw new Error(data.error || 'Failed to update asset');
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
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
      const response = await fetch(`/api/remove-asset?symbol=${encodeURIComponent(symbol)}&dataSource=${dataSource}`, {
        method: 'DELETE',
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);

      if (data.success) {
        console.log('Asset removal successful, refreshing portfolio data');
        // Trigger full refresh including KPI data (AUM ribbon)
        if (onRefresh) {
          onRefresh();
        } else {
          fetchPortfolioData(); // Fallback to local refresh
        }
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

  const getRiskColorClass = (riskLevel: string) => {
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

  const getChainColorClass = (chain: string) => {
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

  // Calculate distributions and colors - Must be before early returns to comply with React Hooks rules
  const calculateDistribution = useMemo(() => (groupBy: keyof PortfolioAsset) => {
    const groups: { [key: string]: number } = {};
    assets.forEach(asset => {
      const value = asset[groupBy];
      if (value !== undefined && value !== null) {
        const key = value.toString();
        groups[key] = (groups[key] || 0) + asset.totalValue;
      }
    });
    return groups;
  }, [assets]);

  const assetDistribution = useMemo(() => calculateDistribution('assetName'), [calculateDistribution]);
  const detailedRiskDistribution = useMemo(() => assets.reduce((acc, asset) => {
    acc[asset.riskLevel] = (acc[asset.riskLevel] || 0) + (asset.quantity * asset.currentPrice);
    return acc;
  }, {} as Record<string, number>), [assets]);

  const locationDistribution = useMemo(() => calculateDistribution('location'), [calculateDistribution]);
  const assetTypeDistribution = useMemo(() => assets.reduce((acc, asset) => {
    acc[asset.coinType] = (acc[asset.coinType] || 0) + (asset.quantity * asset.currentPrice);
    return acc;
  }, {} as Record<string, number>), [assets]);

  const totalValue = useMemo(() => assets.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0), [assets]);

  // Map asset names to brand-specific colors
  const assetColors = useMemo(() => {
    const colors: Record<string, string> = {};
    const uniqueAssets = Object.keys(assetDistribution);
    
    uniqueAssets.forEach(assetName => {
      // Normalize asset name for lookup (lowercase, remove spaces)
      const normalizedName = assetName.toLowerCase().replace(/\s+/g, '');
      
      // Try to find matching brand color
      const brandColor = (COLORS.assetBrands as Record<string, string>)[normalizedName] 
        || (COLORS.assetBrands as Record<string, string>)[assetName.toLowerCase()]
        || (COLORS.assetBrands as Record<string, string>)['default'];
      
      colors[assetName] = brandColor;
    });
    
    return colors;
  }, [assetDistribution]);

  if (loading) {
    return (
      <div className={`${className} space-y-6`}>
        {/* Portfolio Breakdown Charts Skeleton */}
        <div className="grid grid-cols-1 gap-6">
          <ChartSkeleton />
        </div>

        {/* Portfolio Distribution Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          <DistributionCardSkeleton />
          <DistributionCardSkeleton />
          <DistributionCardSkeleton />
        </div>

        {/* Assets Table Skeleton */}
        <div className="border border-gray-700 rounded-lg bg-gray-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <Skeleton height="1.5rem" width="150px" />
            <Skeleton height="2.5rem" width="100px" />
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <Skeleton height="2rem" width="2rem" rounded />
                      <div>
                        <Skeleton height="1rem" width="80px" className="mb-1" />
                        <Skeleton height="0.875rem" width="120px" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton height="1.25rem" width="100px" className="mb-1" />
                      <Skeleton height="0.875rem" width="80px" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Skeleton height="0.75rem" width="40px" className="mb-1" />
                      <Skeleton height="1rem" width="60px" />
                    </div>
                    <div>
                      <Skeleton height="0.75rem" width="50px" className="mb-1" />
                      <Skeleton height="1rem" width="80px" />
                    </div>
                    <div>
                      <Skeleton height="0.75rem" width="30px" className="mb-1" />
                      <Skeleton height="1rem" width="70px" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

  // No duplicate logic needed - all distributions calculated above before early returns


  // Performance dashboard doesn't use this component
  if (dataSource === 'performance-dashboard') {
    return null;
  }

  return (
    <div className={`${className} space-y-6`}>

      {/* Portfolio Breakdown Charts */}
      <div className="grid grid-cols-1 gap-6">
        <StackedBarChart
          title="Breakdown by Asset"
          data={assetDistribution}
          colors={assetColors}
          formatValue={formatCurrency}
        />
      </div>

      {/* Portfolio Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <LocationDistributionCard
          data={locationDistribution}
          totalValue={totalValue}
          formatValue={formatCurrency}
        />
        <AssetTypeDistributionCard
          data={assetTypeDistribution}
          totalValue={totalValue}
          formatValue={formatCurrency}
        />
        <RiskDistributionCard
          data={detailedRiskDistribution}
          totalValue={totalValue}
          formatValue={formatCurrency}
        />
      </div>

      {/* Assets Table */}
      <WagmiCard variant="container" theme="green" size="lg" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <WagmiText variant="h4" weight="semibold" color="primary">Portfolio Assets</WagmiText>
          <WagmiButton
            variant="primary"
            onClick={() => setShowSearchModal(true)}
            className="flex items-center space-x-2"
          >
            <span>Add Asset</span>
          </WagmiButton>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="p-4 space-y-4">
            {sortedAssets.map((asset, index) => (
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
                    <div className="flex gap-1">
                      <WagmiButton
                        variant="icon"
                        theme="blue"
                        size="sm"
                        onClick={() => handleEditAsset(asset)}
                        title="Edit asset"
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      />
                      <WagmiButton
                        variant="icon"
                        theme="red"
                        size="sm"
                        onClick={() => handleRemoveAsset(asset.symbol)}
                        disabled={removingAsset === asset.symbol}
                        loading={removingAsset === asset.symbol}
                        title="Remove asset"
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      />
                    </div>
                  </div>
                </div>
                
                {/* Asset Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wide">Chain</div>
                    <div className={`font-medium ${getChainColorClass(asset.chain)}`}>{asset.chain}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wide">Risk</div>
                    <div className={`font-medium ${getRiskColorClass(asset.riskLevel)}`}>{asset.riskLevel}</div>
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
            <table className="w-full table-fixed">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="w-32">
                  <SortableHeader sortKey="assetName" currentSort={sortConfig} onSort={handleSort} align="left">
                    Asset
                  </SortableHeader>
                </th>
                <th className="w-20">
                  <SortableHeader sortKey="chain" currentSort={sortConfig} onSort={handleSort} align="left">
                    Chain
                  </SortableHeader>
                </th>
                <th className="w-16">
                  <SortableHeader sortKey="riskLevel" currentSort={sortConfig} onSort={handleSort} align="left">
                    Risk
                  </SortableHeader>
                </th>
                <th className="w-24">
                  <SortableHeader sortKey="location" currentSort={sortConfig} onSort={handleSort} align="left">
                    Location
                  </SortableHeader>
                </th>
                <th className="w-20">
                  <SortableHeader sortKey="coinType" currentSort={sortConfig} onSort={handleSort} align="left">
                    Type
                  </SortableHeader>
                </th>
                <th className="w-24">
                  <SortableHeader sortKey="quantity" currentSort={sortConfig} onSort={handleSort} align="right">
                    Quantity
                  </SortableHeader>
                </th>
                <th className="w-20">
                  <SortableHeader sortKey="currentPrice" currentSort={sortConfig} onSort={handleSort} align="right">
                    Price
                  </SortableHeader>
                </th>
                <th className="w-20">
                  <SortableHeader sortKey="priceChange24h" currentSort={sortConfig} onSort={handleSort} align="right">
                    24h Change
                  </SortableHeader>
                </th>
                <th className="w-24">
                  <SortableHeader sortKey="totalValue" currentSort={sortConfig} onSort={handleSort} align="right">
                    Value
                  </SortableHeader>
                </th>
                <th className="w-24 text-center sticky right-0 bg-gray-900/95 backdrop-blur-sm z-10 border-l border-gray-700">
                  <WagmiText variant="label" color="muted">Actions</WagmiText>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedAssets.map((asset, index) => (
                <tr key={`${asset.symbol}-${index}`} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-3 py-4 truncate">
                    <div>
                      <div className="text-sm font-medium text-white truncate">{asset.assetName}</div>
                      <div className="text-sm text-gray-400 truncate">{asset.symbol}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 truncate">
                    <span className={`text-sm font-medium ${getChainColorClass(asset.chain)}`}>
                      {asset.chain}
                    </span>
                  </td>
                  <td className="px-3 py-4 truncate">
                    <span className={`text-sm font-medium ${getRiskColorClass(asset.riskLevel)}`}>
                      {asset.riskLevel}
                    </span>
                  </td>
                  <td className="px-3 py-4 truncate">
                    <div className="text-sm text-gray-300 truncate">{asset.location}</div>
                  </td>
                  <td className="px-3 py-4 truncate">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                      {asset.coinType}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="text-sm text-gray-300">{isPrivacyMode ? createMask() : formatNumber(asset.quantity)}</div>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="text-sm text-gray-300">{formatCurrency(asset.currentPrice)}</div>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className={`text-sm font-medium ${formatPriceChange(asset.priceChange24h).color}`}>
                      {formatPriceChange(asset.priceChange24h).text}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="text-sm font-medium text-gray-300">{isPrivacyMode ? createMask() : formatCurrency(asset.totalValue)}</div>
                  </td>
                  <td className="px-3 py-4 text-center sticky right-0 bg-gray-800/95 backdrop-blur-sm z-10 border-l border-gray-700">
                    <div className="flex gap-1 justify-center">
                      <WagmiButton
                        variant="icon"
                        theme="blue"
                        size="sm"
                        onClick={() => handleEditAsset(asset)}
                        title="Edit asset"
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      />
                      <WagmiButton
                        variant="icon"
                        theme="red"
                        size="sm"
                        onClick={() => handleRemoveAsset(asset.symbol)}
                        disabled={removingAsset === asset.symbol}
                        loading={removingAsset === asset.symbol}
                        title="Remove asset"
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      />
                    </div>
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
        dataSource={dataSource}
      />

      {editingAsset && (
        <EditAssetForm
          isOpen={!!editingAsset}
          asset={editingAsset}
          onSave={handleEditAssetSave}
          onClose={() => {
            setEditingAsset(null);
            setShowEditForm(false);
          }}
          dataSource={dataSource}
        />
      )}
    </div>
  );
}