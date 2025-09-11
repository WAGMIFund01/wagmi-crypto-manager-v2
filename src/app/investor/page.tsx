'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WagmiButton from '@/components/ui/WagmiButton';
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
                  {portfolioData.investorName}
                </h2>
                <p style={{ color: '#E0E0E0', fontSize: '14px', margin: 0, lineHeight: '1.3' }}>
                  ID: {privacyMode ? '•••••' : investorId}
                </p>
              </div>
              
              {/* Buttons - Right Aligned */}
              <div className="flex items-center gap-3">
                {/* Privacy Mode Button - Standardized Design */}
                <WagmiButton
                  onClick={() => setPrivacyMode(!privacyMode)}
                  variant={privacyMode ? "primary" : "outline"}
                  theme="green"
                  size="sm"
                  className="!w-7 !h-7 !p-0 !flex !items-center !justify-center"
                  icon={
                    privacyMode ? (
                      // Eye with slash icon (privacy ON)
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      // Open eye icon (privacy OFF)
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    )
                  }
                  title={privacyMode ? 'Show Data' : 'Privacy Mode'}
                />
                
                {/* Sign Out Button - Icon Only (Standardized Design) */}
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
                  {portfolioData.investorName}
                </h2>
                <p style={{ color: '#E0E0E0', fontSize: '14px', margin: 0 }}>
                  ID: {privacyMode ? '•••••' : investorId}
                </p>
            </div>
            
              <WagmiButton
                onClick={() => setPrivacyMode(!privacyMode)}
                variant={privacyMode ? "primary" : "outline"}
                theme="green"
                size="sm"
                className="!w-7 !h-7 !p-0 !flex !items-center !justify-center"
                icon={
                  privacyMode ? (
                    // Eye with slash icon (privacy ON)
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    // Open eye icon (privacy OFF)
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  )
                }
                title={privacyMode ? 'Show Data' : 'Privacy Mode'}
              />
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Initial Investment */}
          <div 
            className="group relative p-4 md:p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)] hover:shadow-green-500/20"
            style={{ 
              backgroundColor: '#1A1F1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-xs md:text-sm font-normal text-gray-400 leading-none">
                Total Invested
              </h3>
              <p className="text-lg md:text-2xl font-bold text-white leading-tight">
                {formatCurrency(portfolioData.initialInvestment, privacyMode)}
              </p>
            </div>
          </div>

          {/* Current Value */}
          <div 
            className="group relative p-4 md:p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)] hover:shadow-green-500/20"
            style={{ 
              backgroundColor: '#1A1F1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-xs md:text-sm font-normal text-gray-400 leading-none">
                Current Value
              </h3>
              <p className="text-lg md:text-2xl font-bold text-white leading-tight">
                {formatCurrency(portfolioData.totalValue, privacyMode)}
              </p>
            </div>
          </div>

          {/* Total P&L */}
          <div 
            className="group relative p-4 md:p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)] hover:shadow-green-500/20"
            style={{ 
              backgroundColor: '#1A1F1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-xs md:text-sm font-normal text-gray-400 leading-none">
                Total P&L
              </h3>
              <p 
                className="text-lg md:text-2xl font-bold leading-tight"
                style={{ 
                  color: privacyMode ? '#FFFFFF' : (portfolioData.totalPnl >= 0 ? '#00FF95' : '#FF4444')
                }}
              >
                {privacyMode ? formatCurrency(portfolioData.totalPnl, privacyMode) : 
                 (portfolioData.totalPnl >= 0 ? '+' : '') + formatCurrency(portfolioData.totalPnl, privacyMode)}
              </p>
            </div>
          </div>

          {/* Total Return */}
          <div 
            className="group relative p-4 md:p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)] hover:shadow-green-500/20"
            style={{ 
              backgroundColor: '#1A1F1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-xs md:text-sm font-normal text-gray-400 leading-none">
                Total Return
              </h3>
              <p 
                className="text-lg md:text-2xl font-bold leading-tight"
                style={{ 
                  color: portfolioData.totalPnlPercentage >= 0 ? '#00FF95' : '#FF4444'
                }}
              >
                {formatPercentage(portfolioData.totalPnlPercentage, false, true)}
              </p>
            </div>
          </div>
        </div>


        {/* Transaction History */}
        <div
          className="group relative rounded-2xl transition-all duration-300"
          style={{
            backgroundColor: '#1A1F1A',
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
              <div className="space-y-4">
                    {transactions.map((transaction, index) => (
                  <div 
                    key={transaction.transactionId || index}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: '#0B0B0B',
                      borderColor: '#333',
                      borderRadius: '12px'
                    }}
                  >
                    {/* Top Row - Date + Type + Amount */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {/* Date */}
                        <span style={{ color: '#E0E0E0', fontSize: '14px', fontWeight: '500' }}>
                          {new Date(transaction.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        
                        {/* Type Tag */}
                          <span 
                          className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-block"
                            style={{
                            backgroundColor: '#00FF95',
                            color: '#1A1A1A',
                            minWidth: 'fit-content',
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            lineHeight: '1.2'
                            }}
                          >
                            {transaction.type}
                          </span>
                      </div>
                      
                      {/* Amount */}
                      <span 
                        className="font-semibold text-sm"
                        style={{ 
                          color: privacyMode ? '#FFFFFF' : (transaction.amount >= 0 ? '#00FF95' : '#FF4444')
                        }}
                      >
                          {privacyMode ? '•••••' : 
                           (transaction.amount >= 0 ? '+' : '') + formatCurrency(transaction.amount, false)}
                      </span>
                    </div>
                    
                    {/* Description */}
                    {transaction.note && (
                      <p 
                        className="text-sm leading-relaxed"
                        style={{ color: '#A0A0A0', margin: 0 }}
                      >
                          {transaction.note}
                      </p>
                    )}
                  </div>
                    ))}
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
