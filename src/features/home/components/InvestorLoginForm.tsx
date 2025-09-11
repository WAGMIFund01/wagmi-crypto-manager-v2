'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StandardModal from '@/components/ui/StandardModal';
import WagmiButton from '@/components/ui/WagmiButton';
import { DevIcon, ManagerIcon } from '@/components/ui/icons/WagmiIcons';
import { signIn } from 'next-auth/react';
// import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/components';

export function InvestorLoginForm() {
  const [investorId, setInvestorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDevModal, setShowDevModal] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [devError, setDevError] = useState('');
  const router = useRouter();

  const handleInvestorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/validate-investor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ investorId }),
      });

      const data = await response.json();

      if (data.valid) {
        // Store investor ID and data in session storage
        sessionStorage.setItem('investorId', investorId);
        if (data.investor) {
          sessionStorage.setItem('investorData', JSON.stringify(data.investor));
        }
        router.push('/investor');
      } else {
        // Handle specific error codes
        switch (data.errorCode) {
          case 'MISSING_INVESTOR_ID':
            setError('Please enter your Investor ID.');
            break;
          case 'SERVICE_NOT_CONFIGURED':
            setError('Investor validation service is not yet configured. Please contact the administrator.');
            break;
          case 'INVALID_INVESTOR_ID':
            setError('Invalid Investor ID. Please check your ID and try again.');
            break;
          case 'INTERNAL_SERVER_ERROR':
            setError('Server error occurred. Please try again later.');
            break;
          default:
            setError(data.error || 'Unable to verify Investor ID. Please try again.');
        }
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManagerLogin = async () => {
    try {
      // Trigger Google OAuth sign-in
      await signIn('google', { 
        callbackUrl: '/portfoliooverview',
        redirect: true 
      });
    } catch (error) {
      console.error('OAuth sign-in error:', error);
      setError('Failed to initiate manager login. Please try again.');
    }
    // For now, show a message about setting up OAuth
    // TODO: Enable Google OAuth when credentials are configured
  };

  const handleDevAccess = () => {
    setShowDevModal(true);
    setDevPassword('');
    setDevError('');
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDevError('');

    if (devPassword === 'DEV') {
      // Create a mock session for development
      const mockSession = {
        user: {
          email: 'dev@wagmi.com',
          name: 'Dev User',
          role: 'manager'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      // Store in sessionStorage for development
      sessionStorage.setItem('devSession', JSON.stringify(mockSession));
      sessionStorage.setItem('isDevMode', 'true');
      
      // Redirect to dashboard
      router.push('/portfoliooverview');
    } else {
      setDevError('Invalid dev password. Please try again.');
    }
  };

  const closeDevModal = () => {
    setShowDevModal(false);
    setDevPassword('');
    setDevError('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundColor: '#0B0B0B'
      }}
    >
      {/* Main Container */}
      <div className="w-full max-w-2xl rounded-xl p-8 relative">
        {/* Main Dark Card */}
        <div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-5xl font-bold mb-2"
              style={{ 
                color: '#00FF95',
                textShadow: '0 0 20px rgba(0, 255, 149, 0.5), 0 0 40px rgba(0, 255, 149, 0.3)'
              }}
            >
              WAGMI
            </h1>
            <p 
              className="text-lg"
              style={{ color: '#A0A0A0' }}
            >
              We&apos;re All Gonna Make It
            </p>
      </div>

          {/* Investor Login Section */}
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#1A1F1A' }}>
            <h2 className="text-white text-xl font-semibold text-left mb-6">
              Investor Login
            </h2>
            
            <form onSubmit={handleInvestorLogin} className="space-y-4">
              <div>
                <label htmlFor="investorId" className="block text-white text-sm font-medium mb-2">
                  Investor ID
                </label>
                <input
                  type="text"
                  id="investorId"
                  value={investorId}
                  onChange={(e) => setInvestorId(e.target.value.toUpperCase())}
                  placeholder="Enter your Investor ID"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-transparent transition-all duration-200"                    
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 149, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4B5563';
                  }}
                  required
                />
          </div>
              
              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 p-3 rounded-lg">
                  {error}
            </div>
              )}
              
              <WagmiButton
                type="submit"
                variant="primary"
                theme="green"
                size="lg"
                loading={isLoading}
                disabled={!investorId.trim()}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Access Portfolio'}
              </WagmiButton>
            </form>
            
            <p className="text-gray-400 text-sm text-center mt-4">
              Don&apos;t have your Investor ID? Contact your fund manager for access credentials.
            </p>
      </div>
    </div>

        {/* Manager Access Buttons - Positioned outside main card */}
        <div className="flex justify-end gap-4 mt-6">
          {/* Dev Access Button */}
          <WagmiButton
            onClick={handleDevAccess}
            variant="outline"
            theme="orange"
            size="lg"
            icon={<DevIcon />}
          >
            Dev Access
          </WagmiButton>

          {/* Manager Access Button */}
          <WagmiButton
            onClick={handleManagerLogin}
            variant="outline"
            theme="green"
            size="lg"
            icon={<ManagerIcon />}
          >
            Manager Access
          </WagmiButton>
    </div>

    {/* Dev Access Modal */}
    <StandardModal
      isOpen={showDevModal}
      onClose={closeDevModal}
      title="Dev Access"
      size="md"
      theme="orange"
    >
      <div className="space-y-4">
        <p style={{ color: '#A0A0A0', textAlign: 'center' }}>
          Enter dev password to bypass OAuth
        </p>

        {/* Dev Login Form */}
        <form onSubmit={handleDevLogin} className="space-y-4">
            <div>
              <label htmlFor="devPassword" className="block text-white text-sm font-medium mb-2">
                Dev Password
              </label>
              <input
                type="password"
                id="devPassword"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                placeholder="Enter dev password"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-transparent transition-all duration-200"                    
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 107, 53, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#4B5563';
                }}
                required
                autoFocus
              />
            </div>
            
            {devError && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 p-3 rounded-lg">
                {devError}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeDevModal}
                className="flex-1 font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #666',
                  color: '#A0A0A0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(160, 160, 160, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!devPassword.trim()}
                className="flex-1 disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: '#FF6B35',
                  color: '#FFFFFF',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#E55A2B';
                    e.currentTarget.style.boxShadow = '0px 0px 8px rgba(255, 107, 53, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#FF6B35';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                Access Dashboard
              </button>
            </div>
          </form>
        </div>
      </StandardModal>
    </div>
    </div>
  );
}
