'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface InvestorData {
  name: string;
  email: string;
  investmentValue: number;
  currentValue: number;
  returnPercentage: number;
}

export default function InvestorPage() {
  const router = useRouter();
  const [privacyMode, setPrivacyMode] = useState(false);
  const [investorId, setInvestorId] = useState<string>('');
  const [investorData, setInvestorData] = useState<InvestorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if investor ID is stored in session storage
    const storedInvestorId = sessionStorage.getItem('investorId');
    const storedInvestorData = sessionStorage.getItem('investorData');
    
    if (!storedInvestorId) {
      router.push('/');
      return;
    }
    
    setInvestorId(storedInvestorId);
    
    if (storedInvestorData) {
      try {
        setInvestorData(JSON.parse(storedInvestorData));
      } catch (error) {
        console.error('Error parsing investor data:', error);
      }
    }
    
    setLoading(false);
  }, [router]);

  if (loading || !investorId) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: '#111' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#00FF95' }}></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Use real data from Google Sheets or fallback to mock data
  const portfolioData = investorData ? {
    totalValue: investorData.currentValue,
    totalPnl: investorData.currentValue - investorData.investmentValue,
    totalPnlPercentage: investorData.returnPercentage,
    investorName: investorData.name,
    investorEmail: investorData.email
  } : {
    totalValue: 0,
    totalPnl: 0,
    totalPnlPercentage: 0,
    investorName: 'Unknown',
    investorEmail: 'unknown@example.com'
  };

  // Format currency with privacy mode
  const formatCurrency = (value: number, privacy: boolean) => {
    if (privacy) return '••••••';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  // Format percentage with privacy mode and direction
  const formatPercentage = (value: number, privacy: boolean, showSign: boolean = false) => {
    if (privacy) return '••••';
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#111' }}
    >
      {/* Header */}
      <header 
        className="border-b"
        style={{ 
          backgroundColor: '#16181D',
          borderColor: '#333'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 
                className="text-xl font-semibold"
                style={{ color: '#00FF95' }}
              >
                Investor Dashboard
              </h1>
              <p 
                className="text-sm"
                style={{ color: '#A0A0A0' }}
              >
                {portfolioData.investorName} | ID: {investorId}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className="font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: privacyMode ? '#00FF95' : 'transparent',
                  border: '1px solid #00FF95',
                  color: privacyMode ? '#111' : '#00FF95',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!privacyMode) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.1)';
                    e.currentTarget.style.boxShadow = '0px 0px 10px rgba(0, 255, 149, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!privacyMode) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {privacyMode ? 'Show Data' : 'Privacy Mode'}
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('investorId');
                  router.push('/');
                }}
                className="font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #00FF95',
                  color: '#00FF95',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.1)';
                  e.currentTarget.style.boxShadow = '0px 0px 10px rgba(0, 255, 149, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Value Card */}
          <div 
            className="rounded-xl p-6 transition-all duration-200"
            style={{ 
              backgroundColor: '#16181D',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 149, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }}
          >
            <h3 
              className="text-sm font-medium mb-2"
              style={{ color: '#A0A0A0' }}
            >
              Total Portfolio Value
            </h3>
            <p 
              className="text-2xl font-bold"
              style={{ color: '#FFFFFF' }}
            >
              {formatCurrency(portfolioData.totalValue, privacyMode)}
            </p>
          </div>

          {/* Total P&L Card */}
          <div 
            className="rounded-xl p-6 transition-all duration-200"
            style={{ 
              backgroundColor: '#16181D',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 149, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }}
          >
            <h3 
              className="text-sm font-medium mb-2"
              style={{ color: '#A0A0A0' }}
            >
              Total P&L
            </h3>
            <p 
              className="text-2xl font-bold"
              style={{ 
                color: portfolioData.totalPnl >= 0 ? '#00FF95' : '#FF4444'
              }}
            >
              {portfolioData.totalPnl >= 0 ? '+' : ''}{formatCurrency(portfolioData.totalPnl, privacyMode)}
            </p>
          </div>

          {/* Total Return Card */}
          <div 
            className="rounded-xl p-6 transition-all duration-200"
            style={{ 
              backgroundColor: '#16181D',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 149, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }}
          >
            <h3 
              className="text-sm font-medium mb-2"
              style={{ color: '#A0A0A0' }}
            >
              Total Return
            </h3>
            <p 
              className="text-2xl font-bold"
              style={{ 
                color: portfolioData.totalPnlPercentage >= 0 ? '#00FF95' : '#FF4444'
              }}
            >
              {formatPercentage(portfolioData.totalPnlPercentage, privacyMode, true)}
            </p>
          </div>
        </div>

        {/* Portfolio Summary Section */}
        <div 
          className="rounded-xl p-6"
          style={{ 
            backgroundColor: '#16181D',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <h2 
            className="text-lg font-semibold mb-6"
            style={{ color: '#00FF95' }}
          >
            Portfolio Summary
          </h2>
          
          <div className="space-y-4">
            {/* Initial Investment Row */}
            <div 
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ 
                backgroundColor: '#1A1D23',
                border: '1px solid #333'
              }}
            >
              <div>
                <h3 
                  className="font-semibold"
                  style={{ color: '#FFFFFF' }}
                >
                  Initial Investment
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: '#A0A0A0' }}
                >
                  Initial investment amount
                </p>
              </div>
              <div className="text-right">
                <p 
                  className="font-semibold"
                  style={{ color: '#FFFFFF' }}
                >
                  {formatCurrency(investorData?.investmentValue || 0, privacyMode)}
                </p>
              </div>
            </div>
            
            {/* Current Value Row */}
            <div 
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ 
                backgroundColor: '#1A1D23',
                border: '1px solid #333'
              }}
            >
              <div>
                <h3 
                  className="font-semibold"
                  style={{ color: '#FFFFFF' }}
                >
                  Current Value
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: '#A0A0A0' }}
                >
                  Current portfolio value
                </p>
              </div>
              <div className="text-right">
                <p 
                  className="font-semibold"
                  style={{ color: '#FFFFFF' }}
                >
                  {formatCurrency(portfolioData.totalValue, privacyMode)}
                </p>
              </div>
            </div>
            
            {/* Total Return Row */}
            <div 
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ 
                backgroundColor: '#1A1D23',
                border: '1px solid #333'
              }}
            >
              <div>
                <h3 
                  className="font-semibold"
                  style={{ color: '#FFFFFF' }}
                >
                  Total Return
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: '#A0A0A0' }}
                >
                  Performance since investment
                </p>
              </div>
              <div className="text-right">
                <p 
                  className="font-semibold"
                  style={{ 
                    color: portfolioData.totalPnlPercentage >= 0 ? '#00FF95' : '#FF4444'
                  }}
                >
                  {formatPercentage(portfolioData.totalPnlPercentage, privacyMode, true)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
