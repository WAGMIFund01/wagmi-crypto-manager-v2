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
  transactionId: string;
  investorId: string;
  type: string;
  amount: number;
  date: string;
  note: string;
}

export default function InvestorPage() {
  const router = useRouter();
  const [privacyMode, setPrivacyMode] = useState(false);
  const [investorId, setInvestorId] = useState<string>('');
  const [investorData, setInvestorData] = useState<InvestorData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError('Failed to load investor data. Please try logging in again.');
        setLoading(false);
        return;
      }
    } else {
      setError('No investor data found. Please try logging in again.');
      setLoading(false);
      return;
    }
    
    // Fetch transactions for this investor
    fetchTransactions(storedInvestorId);
    
    setLoading(false);
  }, [router]);

  const fetchTransactions = async (investorId: string) => {
    try {
      const response = await fetch('/api/get-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ investorId }),
      });

      const data = await response.json();
      
      if (data.success && data.transactions) {
        if (data.transactions.length === 0) {
          setError('No transactions found for this investor. Please contact support if this is unexpected.');
        } else {
          setTransactions(data.transactions);
        }
      } else {
        console.error('Failed to fetch transactions:', data.error);
        setError(`Failed to load transaction data: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Unable to connect to transaction database. Please try again later.');
    }
  };

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

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: '#111' }}
      >
        <div 
          className="max-w-md w-full p-6 rounded-xl text-center"
          style={{ 
            backgroundColor: '#16181D',
            border: '1px solid #FF4444'
          }}
        >
          <div className="mb-4">
            <svg 
              className="w-12 h-12 mx-auto"
              style={{ color: '#FF4444' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h2 
            className="text-lg font-semibold mb-2"
            style={{ color: '#FF4444' }}
          >
            Error Loading Data
          </h2>
          <p 
            className="text-sm mb-4"
            style={{ color: '#A0A0A0' }}
          >
            {error}
          </p>
          <button
            onClick={() => {
              sessionStorage.removeItem('investorId');
              sessionStorage.removeItem('investorData');
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
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Use real data from Google Sheets - no fallbacks
  const portfolioData = {
    totalValue: investorData!.currentValue,
    totalPnl: investorData!.currentValue - investorData!.investmentValue,
    totalPnlPercentage: investorData!.returnPercentage,
    investorName: investorData!.name,
    investorEmail: investorData!.email,
    initialInvestment: investorData!.investmentValue
  };

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
                className="text-xl font-bold"
                style={{ color: '#FFFFFF' }}
              >
                {portfolioData.investorName}
              </h1>
              <p 
                className="text-sm"
                style={{ color: '#A0A0A0' }}
              >
                ID: {investorId}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className="p-2 rounded-lg transition-all duration-200"
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
                title={privacyMode ? 'Show Data' : 'Hide Data'}
              >
                {privacyMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('investorId');
                  sessionStorage.removeItem('investorData');
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
                    Transaction Type
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
                    key={transaction.transactionId || index}
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
// Force commit test
