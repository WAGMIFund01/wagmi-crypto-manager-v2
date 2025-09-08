'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/shared/components';
import { formatCurrency, formatPercentage } from '@/shared/utils';

export default function InvestorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (session.user?.role !== 'investor') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'investor') {
    return null;
  }

  // Mock portfolio data - will be replaced with real data later
  const mockPortfolio = {
    totalValue: 125000,
    totalPnl: 15000,
    totalPnlPercentage: 13.6,
    assets: [
      { symbol: 'BTC', name: 'Bitcoin', quantity: 0.5, currentPrice: 45000, value: 22500, pnl: 5000, pnlPercentage: 28.6 },
      { symbol: 'ETH', name: 'Ethereum', quantity: 2.0, currentPrice: 3000, value: 6000, pnl: 1000, pnlPercentage: 20.0 },
      { symbol: 'SOL', name: 'Solana', quantity: 100, currentPrice: 95, value: 9500, pnl: -500, pnlPercentage: -5.0 },
    ]
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
                {session.user?.email} | ID: {session.user?.investorId}
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
                onClick={() => signOut()}
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
                {formatCurrency(mockPortfolio.totalValue, privacyMode)}
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
              <p className={`text-2xl font-semibold ${mockPortfolio.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(mockPortfolio.totalPnl, privacyMode)}
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
              <p className={`text-2xl font-semibold ${mockPortfolio.totalPnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(mockPortfolio.totalPnlPercentage, privacyMode, true)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPortfolio.assets.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{asset.symbol}</h3>
                    <p className="text-sm text-gray-500">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(asset.value, privacyMode)}
                    </p>
                    <p className={`text-sm ${asset.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(asset.pnlPercentage, privacyMode, true)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
