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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Investor Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                {portfolioData.investorName} | ID: {investorId}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant={privacyMode ? "primary" : "outline"}
                size="sm"
                onClick={() => setPrivacyMode(!privacyMode)}
              >
                {privacyMode ? 'Show Data' : 'Privacy Mode'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  sessionStorage.removeItem('investorId');
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
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatCurrency(portfolioData.totalValue, privacyMode)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                Total P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-semibold ${portfolioData.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(portfolioData.totalPnl, privacyMode)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-semibold ${portfolioData.totalPnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(portfolioData.totalPnlPercentage, privacyMode, true)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Investment Value</h3>
                  <p className="text-sm text-gray-500">Initial investment amount</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(investorData?.investmentValue || 0, privacyMode)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Current Value</h3>
                  <p className="text-sm text-gray-500">Current portfolio value</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(portfolioData.totalValue, privacyMode)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Total Return</h3>
                  <p className="text-sm text-gray-500">Performance since investment</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${portfolioData.totalPnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(portfolioData.totalPnlPercentage, privacyMode, true)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
// Light theme restored
