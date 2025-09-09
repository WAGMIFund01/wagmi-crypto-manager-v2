'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/shared/components';
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
          <p className="text-gray-600">Loading...</p>
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
            <p className="text-sm mb-4 text-gray-600">
              {error}
            </p>
            <Button
              onClick={() => {
                sessionStorage.removeItem('investorId');
                sessionStorage.removeItem('investorData');
                router.push('/');
              }}
              variant="outline"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                <h2 className="text-xl font-bold text-gray-900">
                  {portfolioData.investorName}
                </h2>
                <p className="text-sm text-gray-500">
                  ID: {investorId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant={privacyMode ? "primary" : "outline"}
                size="sm"
                onClick={() => setPrivacyMode(!privacyMode)}
                className="flex items-center gap-2"
              >
                {privacyMode ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                    Show Data
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Privacy Mode
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  sessionStorage.removeItem('investorId');
                  sessionStorage.removeItem('investorData');
                  router.push('/');
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Initial Investment */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Initial Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(portfolioData.initialInvestment, privacyMode)}
              </p>
            </CardContent>
          </Card>

          {/* Current Value */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Current Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(portfolioData.totalValue, privacyMode)}
              </p>
            </CardContent>
          </Card>

          {/* Total P&L */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" style={{ color: portfolioData.totalPnl >= 0 ? '#00FF95' : '#FF4444' }}
                {privacyMode ? formatCurrency(portfolioData.totalPnl, privacyMode) : 
                 (portfolioData.totalPnl >= 0 ? '+' : '') + formatCurrency(portfolioData.totalPnl, privacyMode)}
              </p>
            </CardContent>
          </Card>

          {/* Total Return */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" style={{ color: portfolioData.totalPnl >= 0 ? '#00FF95' : '#FF4444' }}
                {formatPercentage(portfolioData.totalPnlPercentage, privacyMode, true)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">
                    Loading transaction history...
                  </p>
                </div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Transaction Type
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={transaction.transactionId || index} className="border-b">
                        <td className="py-3 px-4 text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-3 px-4">
                          <span 
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.type === 'Investment' ? 'bg-green-100 text-green-800' :
                              transaction.type === 'Dividend' ? 'bg-green-100 text-green-800' :
                              transaction.type === 'Fee' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {privacyMode ? formatCurrency(transaction.amount, privacyMode) :
                           (transaction.amount >= 0 ? '+' : '') + formatCurrency(transaction.amount, privacyMode)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
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
                  className="w-12 h-12 mx-auto text-gray-400 mb-4"
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
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
