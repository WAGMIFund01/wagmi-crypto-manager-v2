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

interface Transaction {
  date: string;
  type: 'Investment' | 'Withdrawal' | 'Dividend' | 'Fee';
  amount: number;
  note: string;
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
    investorEmail: investorData.email,
    initialInvestment: investorData.investmentValue
  } : {
    totalValue: 0,
    totalPnl: 0,
    totalPnlPercentage: 0,
    investorName: 'Unknown',
    investorEmail: 'unknown@example.com',
    initialInvestment: 0
  };

  // Mock transaction data - in real app, this would come from the database
  const transactions: Transaction[] = [
    {
      date: '2024-01-15',
      type: 'Investment',
      amount: portfolioData.initialInvestment,
      note: 'Initial investment'
    },
    {
      date: '2024-02-20',
      type: 'Dividend',
      amount: 150.00,
      note: 'Quarterly dividend payment'
    },
    {
      date: '2024-03-10',
      type: 'Fee',
      amount: -25.00,
      note: 'Management fee'
    },
    {
      date: '2024-04-05',
      type: 'Dividend',
      amount: 200.00,
      note: 'Performance bonus'
    }
  ];

  // Format currency with proper formatting rules
  const formatCurrency = (value: number, privacy: boolean) => {
    if (privacy) return '••••••';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format percentage with proper formatting rules
  const formatPercentage = (value: number, privacy: boolean, showSign: boolean = false) => {
    if (privacy) return '••••';
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
        {/* KPI Cards - 4 tiles with glow effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Initial Investment Card */}
          <div 
            className="rounded-xl p-6 transition-all duration-200"
            style={{ 
              backgroundColor: '#16181D',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 149, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }}
          >
            <h3 
              className="text-sm font-medium mb-2"
              style={{ color: '#A0A0A0' }}
            >
              Initial Investment
            </h3>
            <p 
              className="text-2xl font-bold"
              style={{ color: '#FFFFFF' }}
            >
              {formatCurrency(portfolioData.initialInvestment, privacyMode)}
            </p>
          </div>

          {/* Current Value Card */}
          <div 
            className="rounded-xl p-6 transition-all duration-200"
            style={{ 
              backgroundColor: '#16181D',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 149, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }}
          >
            <h3 
              className="text-sm font-medium mb-2"
              style={{ color: '#A0A0A0' }}
            >
              Current Value
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
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 149, 0.15)';
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
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 149, 0.15)';
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

        {/* Transaction Details Table */}
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
            Transaction History
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr 
                  className="border-b"
                  style={{ borderColor: '#333' }}
                >
                  <th 
                    className="text-left py-3 px-4 font-medium"
                    style={{ color: '#A0A0A0' }}
                  >
                    Date
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium"
                    style={{ color: '#A0A0A0' }}
                  >
                    Type
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-medium"
                    style={{ color: '#A0A0A0' }}
                  >
                    Amount
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium"
                    style={{ color: '#A0A0A0' }}
                  >
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr 
                    key={index}
                    className="border-b"
                    style={{ borderColor: '#333' }}
                  >
                    <td 
                      className="py-3 px-4"
                      style={{ color: '#FFFFFF' }}
                    >
                      {formatDate(transaction.date)}
                    </td>
                    <td 
                      className="py-3 px-4"
                    >
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: transaction.type === 'Investment' ? 'rgba(0, 255, 149, 0.1)' :
                                         transaction.type === 'Dividend' ? 'rgba(0, 255, 149, 0.1)' :
                                         transaction.type === 'Fee' ? 'rgba(255, 68, 68, 0.1)' :
                                         'rgba(160, 160, 160, 0.1)',
                          color: transaction.type === 'Investment' ? '#00FF95' :
                                transaction.type === 'Dividend' ? '#00FF95' :
                                transaction.type === 'Fee' ? '#FF4444' :
                                '#A0A0A0'
                        }}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td 
                      className="py-3 px-4 text-right font-semibold"
                      style={{ 
                        color: transaction.amount >= 0 ? '#00FF95' : '#FF4444'
                      }}
                    >
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount, privacyMode)}
                    </td>
                    <td 
                      className="py-3 px-4"
                      style={{ color: '#A0A0A0' }}
                    >
                      {transaction.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
