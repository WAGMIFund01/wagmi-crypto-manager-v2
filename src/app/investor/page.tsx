'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, Button } from '@/shared/components';
import { formatCurrency, formatPercentage } from '@/shared/utils';

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
  const [transactionsLoading, setTransactionsLoading] = useState(false);
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
    setTransactionsLoading(true);
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
        setTransactions(data.transactions);
      } else {
        console.error('Failed to fetch transactions:', data.error);
        // Don't set error for transactions - just log it
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Don't set error for transactions - just log it
    } finally {
      setTransactionsLoading(false);
    }
  };

  if (loading || !investorId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="style={{ color: '#E0E0E0' }}">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <svg 
                className="w-12 h-12 mx-auto text-red-500"
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
            <h2 className="text-lg font-semibold mb-2 text-red-600">
              Error Loading Data
            </h2>
            <p className="text-sm mb-4 style={{ color: '#E0E0E0' }}">
              {error}
            </p>
            <Button
              onClick={() => {
                sessionStorage.removeItem('investorId');
                sessionStorage.removeItem('investorData');
                router.push('/');
              }}
              variant="outline" style={{ backgroundColor: "transparent", color: "#00FF95", borderColor: "#00FF95", borderWidth: "1px", borderStyle: "solid" }}
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use real data from Google Sheets
  const portfolioData = {
    totalValue: investorData!.currentValue,
    totalPnl: investorData!.currentValue - investorData!.investmentValue,
    totalPnlPercentage: investorData!.returnPercentage,
    investorName: investorData!.name,
    investorEmail: investorData!.email,
    initialInvestment: investorData!.investmentValue
  };


  return (
    <div style={{ backgroundColor: '#111' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#16181D', borderColor: '#333' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              {/* WAGMI Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-green-600">
                  WAGMI
                </h1>
              </div>
              
              {/* Investor Info */}
              <div>
                <h2 style={{ color: '#FFFFFF' }}>
                  {portfolioData.investorName}
                </h2>
                <p style={{ color: '#E0E0E0' }}>
                  ID: {investorId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: privacyMode ? '#00FF95' : 'transparent',
                  border: '1px solid #00FF95',
                  color: privacyMode ? 'white' : '#00FF95',
                  boxShadow: 'none',
                  width: '40px',
                  height: '40px'
                }}
                onMouseEnter={(e) => {
                  if (privacyMode) {
                    e.currentTarget.style.backgroundColor = '#00B863';
                    e.currentTarget.style.boxShadow = '0px 0px 8px rgba(0, 255, 149, 0.4)';
                  } else {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.1)';
                    e.currentTarget.style.boxShadow = '0px 0px 10px rgba(0, 255, 149, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (privacyMode) {
                    e.currentTarget.style.backgroundColor = '#00FF95';
                    e.currentTarget.style.boxShadow = 'none';
                  } else {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                title={privacyMode ? 'Show Data' : 'Privacy Mode'}
              >
                {privacyMode ? (
                  // Eye with slash (Privacy Mode ON)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  // Open eye (Privacy Mode OFF)
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
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Initial Investment */}
          <div 
            className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)] hover:shadow-green-500/20"
            style={{ 
              backgroundColor: '#1A1A1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-2">
              <h3 className="text-sm font-normal text-gray-400 leading-none">
                Initial Investment
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(portfolioData.initialInvestment, privacyMode)}
              </p>
            </div>
          </div>

          {/* Current Value */}
          <div 
            className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)] hover:shadow-green-500/20"
            style={{ 
              backgroundColor: '#1A1A1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-2">
              <h3 className="text-sm font-normal text-gray-400 leading-none">
                Current Value
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(portfolioData.totalValue, privacyMode)}
              </p>
            </div>
          </div>

          {/* Total P&L */}
          <div 
            className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)] hover:shadow-green-500/20"
            style={{ 
              backgroundColor: '#1A1A1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-2">
              <h3 className="text-sm font-normal text-gray-400 leading-none">
                Total P&L
              </h3>
              <p 
                className="text-2xl font-bold"
                style={{ 
                  color: portfolioData.totalPnl >= 0 ? '#00FF95' : '#FF4444'
                }}
              >
                {privacyMode ? formatCurrency(portfolioData.totalPnl, privacyMode) : 
                 (portfolioData.totalPnl >= 0 ? '+' : '') + formatCurrency(portfolioData.totalPnl, privacyMode)}
              </p>
            </div>
          </div>

          {/* Total Return */}
          <div 
            className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)] hover:shadow-green-500/20"
            style={{ 
              backgroundColor: '#1A1A1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-2">
              <h3 className="text-sm font-normal text-gray-400 leading-none">
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
        </div>


        {/* Transaction History */}
        <div
          className="group relative rounded-2xl transition-all duration-300"
          style={{
            backgroundColor: '#1A1A1A',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)',
            padding: '24px'
          }}
        >
          <div className="mb-6">
            <h2 
              className="text-lg font-semibold"
              style={{ 
                color: '#00FF95',
                textShadow: '0 0 20px rgba(0, 255, 149, 0.5), 0 0 40px rgba(0, 255, 149, 0.3)'
              }}
            >
              Transaction History
            </h2>
          </div>
          <div>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#00FF95' }}></div>
                  <p style={{ color: '#E0E0E0' }}>Loading transactions...</p>
                </div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#404040' }}>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: '#E0E0E0' }}>Date</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: '#E0E0E0' }}>Transaction Type</th>
                      <th className="text-right py-3 px-4 font-medium" style={{ color: '#E0E0E0' }}>Amount</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: '#E0E0E0' }}>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={transaction.transactionId || index} className="border-b" style={{ borderColor: '#404040' }}>
                        <td className="py-3 px-4" style={{ color: '#E0E0E0' }}>
                          {new Date(transaction.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: transaction.type === 'Investment' ? '#00FF95' : 
                                             transaction.type === 'Dividend' ? '#00FF95' :
                                             transaction.type === 'Fee' ? '#FF4444' : '#A0A0A0',
                              color: transaction.type === 'Investment' || transaction.type === 'Dividend' ? '#1A1A1A' : 'white',
                            }}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold" style={{ 
                          color: transaction.amount >= 0 ? '#00FF95' : '#FF4444' 
                        }}>
                          {privacyMode ? '•••••' : 
                           (transaction.amount >= 0 ? '+' : '') + formatCurrency(transaction.amount, false)}
                        </td>
                        <td className="py-3 px-4" style={{ color: '#E0E0E0' }}>
                          {transaction.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg 
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: '#E0E0E0' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <p style={{ color: '#E0E0E0' }}>No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
