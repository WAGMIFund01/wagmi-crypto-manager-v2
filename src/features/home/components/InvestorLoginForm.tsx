'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
        callbackUrl: '/dashboard',
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
      router.push('/dashboard');
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
              
              <button
                type="submit"
                disabled={!investorId.trim() || isLoading}
                className="w-full disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"                                                           
                style={{
                  backgroundColor: '#00C76F',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#00B863';
                    e.currentTarget.style.boxShadow = '0px 0px 8px rgba(0, 255, 149, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#00C76F';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isLoading ? 'Verifying...' : 'Access Portfolio'}
              </button>
            </form>
            
            <p className="text-gray-400 text-sm text-center mt-4">
              Don&apos;t have your Investor ID? Contact your fund manager for access credentials.
            </p>
      </div>
    </div>

        {/* Manager Access Buttons - Positioned outside main card */}
        <div className="flex justify-end gap-4 mt-6">
          {/* Dev Access Button */}
          <button
            onClick={handleDevAccess}
            className="font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #FF6B35',
              color: '#FF6B35',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
              e.currentTarget.style.boxShadow = '0px 0px 10px rgba(255, 107, 53, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Dev Access
          </button>

          {/* Manager Access Button */}
          <button
            onClick={handleManagerLogin}
            className="font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center"
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
            Manager Access
          </button>
    </div>

    {/* Dev Access Modal */}
    {showDevModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          className="w-full max-w-md rounded-xl p-6 relative"
          style={{ backgroundColor: '#1A1F1A' }}
        >
          {/* Close Button */}
          <button
            onClick={closeDevModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ 
                color: '#FF6B35',
                textShadow: '0 0 10px rgba(255, 107, 53, 0.3)'
              }}
            >
              Dev Access
            </h2>
            <p style={{ color: '#A0A0A0' }}>
              Enter dev password to bypass OAuth
            </p>
          </div>

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

          {/* Dev Info */}
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 107, 53, 0.1)' }}>
            <p className="text-xs text-orange-300 text-center">
              💡 Dev mode: Password is &quot;DEV&quot; (case sensitive)
            </p>
          </div>
        </div>
      </div>
    )}
    </div>
    </div>
  );
}
