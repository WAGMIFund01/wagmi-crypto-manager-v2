'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/components';

export function InvestorLoginForm() {
  const [investorId, setInvestorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInvestorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Replace with actual Google Sheets API call
      // For now, we'll simulate the check
      const response = await fetch('/api/validate-investor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ investorId }),
      });

      const data = await response.json();

      if (data.valid) {
        // Store investor ID in session storage for now
        sessionStorage.setItem('investorId', investorId);
        router.push('/investor');
      } else {
        setError('Invalid Investor ID. Please check your ID and try again.');
      }
    } catch {
      setError('Unable to verify Investor ID. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManagerLogin = () => {
    // Redirect to Google OAuth for manager access
    window.location.href = '/api/auth/signin/google';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            WAGMI Crypto Investment Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Professional cryptocurrency portfolio tracking platform
          </p>
        </div>

        {/* Investor Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Investor Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvestorLogin} className="space-y-4">
              <div>
                <label htmlFor="investorId" className="block text-sm font-medium text-gray-700 mb-2">
                  Investor ID
                </label>
                <input
                  type="text"
                  id="investorId"
                  value={investorId}
                  onChange={(e) => setInvestorId(e.target.value.toUpperCase())}
                  placeholder="Enter your Investor ID (e.g., INV001)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!investorId.trim()}
              >
                {isLoading ? 'Verifying...' : 'Access Portfolio'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Manager Access Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Manager Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center mb-4">
              Full access to manage all investor portfolios
            </p>
            <Button
              onClick={handleManagerLogin}
              variant="outline"
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Manager Login with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
