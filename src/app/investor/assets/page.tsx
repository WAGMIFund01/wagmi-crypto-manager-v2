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
    <div style={{ backgroundColor: '#0B0B0B' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#0B0B0B', borderColor: '#333' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Layout - Stacked */}
          <div className="flex flex-col space-y-6 py-6 md:hidden">
            {/* Top Row - Centered Logo */}
            <div className="flex justify-center">
              <h1 
                className="font-bold"
                style={{ 
                  color: '#00FF95',
                  fontSize: '28px',
                  lineHeight: '1.2',
                  textShadow: '0 0 25px rgba(0, 255, 149, 0.6), 0 0 50px rgba(0, 255, 149, 0.4), 0 0 75px rgba(0, 255, 149, 0.2)',
                  letterSpacing: '0.05em'
                }}
              >
                WAGMI
              </h1>
            </div>
            
            {/* Bottom Row - Investor Info + Buttons */}
            <div className="flex items-center justify-between px-2">
              {/* Investor Info - Left Aligned */}
              <div className="text-left">
                <h2 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600', margin: 0, lineHeight: '1.3' }}>
                  {sessionStorage.getItem('investorData') ? JSON.parse(sessionStorage.getItem('investorData')!).name : 'Investor'}
                </h2>
                <p style={{ color: '#E0E0E0', fontSize: '14px', margin: 0, lineHeight: '1.3' }}>
                  ID: {sessionStorage.getItem('investorId') || 'Unknown'}
                </p>
                <p style={{ color: '#A0A0A0', fontSize: '12px', margin: 0, lineHeight: '1.3' }}>
                  Asset Details
                </p>
              </div>
              
              {/* Buttons - Right Aligned */}
              <div className="flex items-center gap-3">
                {/* Sign Out Button */}
                <WagmiButton
                  onClick={() => {
                    sessionStorage.removeItem('investorId');
                    sessionStorage.removeItem('investorData');
                    router.push('/');
                  }}
                  variant="outline"
                  theme="green"
                  size="icon"
                  icon={
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                  }
                  title="Sign Out"
                />
              </div>
            </div>
          </div>

          {/* Desktop Layout - Horizontal */}
          <div className="hidden md:flex justify-between items-center h-16">
            <div className="flex items-center" style={{ paddingLeft: '32px' }}>
              {/* WAGMI Logo */}
              <div className="flex items-center">
                <h1 
                  className="font-bold"
                  style={{ 
                    color: '#00FF95',
                    fontSize: '32px',
                    lineHeight: '1.2',
                    textShadow: '0 0 25px rgba(0, 255, 149, 0.6), 0 0 50px rgba(0, 255, 149, 0.4), 0 0 75px rgba(0, 255, 149, 0.2)',
                    letterSpacing: '0.05em'
                  }}
                >
                  WAGMI
                </h1>
              </div>
            </div>
              
            <div className="flex items-center gap-4">
              {/* Investor Info */}
              <div className="text-right mr-4">
                <h2 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                  {sessionStorage.getItem('investorData') ? JSON.parse(sessionStorage.getItem('investorData')!).name : 'Investor'}
                </h2>
                <p style={{ color: '#E0E0E0', fontSize: '14px', margin: 0 }}>
                  ID: {sessionStorage.getItem('investorId') || 'Unknown'}
                </p>
                <p style={{ color: '#A0A0A0', fontSize: '12px', margin: 0 }}>
                  Asset Details
                </p>
              </div>
              
              <WagmiButton
                onClick={() => {
                  sessionStorage.removeItem('investorId');
                  sessionStorage.removeItem('investorData');
                  router.push('/');
                }}
                variant="outline"
                theme="green"
                size="sm"
                className="!w-7 !h-7 !p-0 !flex !items-center !justify-center"
                icon={
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                }
                title="Sign Out"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
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
        </div>

        {/* Assets Table */}
        <WagmiCard variant="container" theme="green" size="lg" className="overflow-hidden">
          
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
                        {formatPercentage((asset.totalValue / totalPortfolioValue) * 100)}
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
                          {formatPercentage((asset.totalValue / totalPortfolioValue) * 100)}
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
