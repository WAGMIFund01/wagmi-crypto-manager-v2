'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WagmiButton, WagmiCard, WagmiSpinner, WagmiText } from '@/components/ui';
import { formatCurrency, formatPercentage } from '@/shared/utils';
import { PortfolioAsset } from '@/app/api/get-portfolio-data/route';

export default function InvestorAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    // Check if investor ID is stored in session storage
    const storedInvestorId = sessionStorage.getItem('investorId');
    
    if (!storedInvestorId) {
      router.push('/investor/login');
      return;
    }

    fetchAssets();
  }, [router]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/get-portfolio-data');
      const data = await response.json();

      if (data.success) {
        setAssets(data.assets);
      } else {
        setError(data.error || 'Failed to fetch portfolio data');
      }
    } catch (err) {
      setError('Failed to fetch portfolio data');
    } finally {
      setLoading(false);
    }
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

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      case 'none':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'memecoin':
        return 'text-pink-400';
      case 'major':
        return 'text-blue-400';
      case 'altcoin':
        return 'text-purple-400';
      case 'stablecoin':
        return 'text-green-400';
      case 'degen':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  // Calculate total portfolio value for allocation percentage
  const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);

  const createMask = () => {
    return '••••••';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <WagmiSpinner 
          size="lg" 
          theme="green" 
          text="Loading assets..." 
          showText={true} 
          centered={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center">
          <WagmiText variant="h3" color="error" className="mb-4">
            Error Loading Assets
          </WagmiText>
          <WagmiText variant="body" color="muted" className="mb-6">
            {error}
          </WagmiText>
          <WagmiButton
            variant="outline"
            theme="green"
            onClick={() => router.push('/investor')}
          >
            Back to Dashboard
          </WagmiButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <WagmiButton
              variant="outline"
              theme="green"
              size="sm"
              onClick={() => router.push('/investor')}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </WagmiButton>

            {/* Page Title */}
            <WagmiText variant="h3" weight="bold" color="primary">
              Fund Assets
            </WagmiText>

            {/* Privacy Toggle */}
            <WagmiButton
              variant="outline"
              theme="green"
              size="sm"
              onClick={() => setPrivacyMode(!privacyMode)}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{privacyMode ? 'Show' : 'Hide'}</span>
            </WagmiButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assets Table */}
        <WagmiCard variant="container" theme="green" size="lg" className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <WagmiText variant="h4" weight="semibold" color="primary">
              Portfolio Assets ({assets.length})
            </WagmiText>
          </div>
          
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="p-4 space-y-4">
              {assets.map((asset, index) => (
                <div key={`${asset.symbol}-${index}`} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  {/* Asset Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <WagmiText variant="h5" weight="semibold" color="primary">
                        {asset.assetName}
                      </WagmiText>
                      <WagmiText variant="small" color="muted">
                        {asset.symbol}
                      </WagmiText>
                    </div>
                    <div className="text-right">
                      <WagmiText variant="body" weight="semibold" color="primary">
                        {privacyMode ? createMask() : formatPercentage((asset.totalValue / totalPortfolioValue) * 100)}
                      </WagmiText>
                      <div className={`text-sm font-medium ${formatPriceChange(asset.priceChange24h).color}`}>
                        {formatPriceChange(asset.priceChange24h).text}
                      </div>
                    </div>
                  </div>
                  
                  {/* Asset Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <WagmiText variant="small" color="muted" className="uppercase tracking-wide">
                        Type
                      </WagmiText>
                      <WagmiText variant="small" className={getTypeColor(asset.coinType)}>
                        {asset.coinType}
                      </WagmiText>
                    </div>
                    <div>
                      <WagmiText variant="small" color="muted" className="uppercase tracking-wide">
                        Risk
                      </WagmiText>
                      <WagmiText variant="small" className={getRiskColor(asset.riskLevel)}>
                        {asset.riskLevel}
                      </WagmiText>
                    </div>
                  </div>
                  
                  {/* Thesis */}
                  {asset.thesis && (
                    <div className="pt-3 border-t border-gray-700">
                      <WagmiText variant="small" color="muted" className="uppercase tracking-wide mb-1">
                        Investment Thesis
                      </WagmiText>
                      <WagmiText variant="small" color="secondary">
                        {asset.thesis}
                      </WagmiText>
                    </div>
                  )}
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
                      <WagmiText variant="label" color="muted">Type</WagmiText>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <WagmiText variant="label" color="muted">Risk</WagmiText>
                    </th>
                    <th className="px-6 py-3 text-right">
                      <WagmiText variant="label" color="muted">Allocation %</WagmiText>
                    </th>
                    <th className="px-6 py-3 text-right">
                      <WagmiText variant="label" color="muted">24h Change</WagmiText>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <WagmiText variant="label" color="muted">Thesis</WagmiText>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {assets.map((asset, index) => (
                    <tr key={`${asset.symbol}-${index}`} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <WagmiText variant="body" weight="medium" color="primary">
                            {asset.assetName}
                          </WagmiText>
                          <WagmiText variant="small" color="muted">
                            {asset.symbol}
                          </WagmiText>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <WagmiText variant="body" className={getTypeColor(asset.coinType)}>
                          {asset.coinType}
                        </WagmiText>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <WagmiText variant="body" className={getRiskColor(asset.riskLevel)}>
                          {asset.riskLevel}
                        </WagmiText>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <WagmiText variant="body" weight="medium" color="primary">
                          {privacyMode ? createMask() : formatPercentage((asset.totalValue / totalPortfolioValue) * 100)}
                        </WagmiText>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <WagmiText variant="body" weight="medium" className={formatPriceChange(asset.priceChange24h).color}>
                          {formatPriceChange(asset.priceChange24h).text}
                        </WagmiText>
                      </td>
                      <td className="px-6 py-4">
                        <WagmiText variant="small" color="secondary" className="max-w-md">
                          {asset.thesis || 'No thesis available'}
                        </WagmiText>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </WagmiCard>
      </div>
    </div>
  );
}
