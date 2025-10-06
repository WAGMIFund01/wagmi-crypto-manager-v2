'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StandardModal from '@/components/ui/StandardModal';
import WagmiButton from '@/components/ui/WagmiButton';
import WagmiInput from '@/components/ui/WagmiInput';
import WagmiAlert from '@/components/ui/WagmiAlert';
import { DevIcon } from '@/components/ui/icons/WagmiIcons';
import { signIn } from 'next-auth/react';
// import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/components';

export function InvestorLoginForm() {
  const [investorId, setInvestorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDevModal, setShowDevModal] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [devError, setDevError] = useState('');
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  const [householdPassword, setHouseholdPassword] = useState('');
  const [householdError, setHouseholdError] = useState('');
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
        callbackUrl: '/module-selection',
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
      
      // Redirect to module selection
      router.push('/module-selection');
    } else {
      setDevError('Invalid dev password. Please try again.');
    }
  };

  const closeDevModal = () => {
    setShowDevModal(false);
    setDevPassword('');
    setDevError('');
  };

  const handleHouseholdAccess = () => {
    setShowHouseholdModal(true);
    setHouseholdPassword('');
    setHouseholdError('');
  };

  const handleHouseholdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setHouseholdError('');

    if (householdPassword === 'teamrasco') {
      // Create a mock session for household access (similar to dev access)
      const mockSession = {
        user: {
          email: 'household@wagmi.com',
          name: 'Household User',
          role: 'household'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      // Store in sessionStorage for household access
      sessionStorage.setItem('householdSession', JSON.stringify(mockSession));
      sessionStorage.setItem('isHouseholdMode', 'true');
      
      // Redirect to household personal portfolio page
      router.push('/personal-portfolio-household');
    } else {
      setHouseholdError('Invalid password. Please try again.');
    }
  };

  const closeHouseholdModal = () => {
    setShowHouseholdModal(false);
    setHouseholdPassword('');
    setHouseholdError('');
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
              <WagmiInput
            variant="default"
            label="Investor ID"
            placeholder="Enter your Investor ID"
            value={investorId}
            onChange={(e) => setInvestorId(e.target.value.toUpperCase())}
            theme="green"
            size="md"
            required
          />
              
              {error && (
                <WagmiAlert variant="error" size="md">
                  {error}
                </WagmiAlert>
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

          {/* Household Portfolio Login Button */}
          <WagmiButton
            onClick={handleHouseholdAccess}
            variant="outline"
            theme="blue"
            size="lg"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            }
            title="Household Portfolio Login"
          >
          </WagmiButton>

          {/* Manager Access Button */}
          <WagmiButton
            onClick={handleManagerLogin}
            variant="outline"
            theme="green"
            size="lg"
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
            <WagmiInput
              variant="password"
              label="Dev Password"
              placeholder="Enter dev password"
              value={devPassword}
              onChange={(e) => setDevPassword(e.target.value)}
              theme="orange"
              size="md"
              required
              autoFocus
            />
            
            {devError && (
              <WagmiAlert variant="error" size="md">
                {devError}
              </WagmiAlert>
            )}
            
            <div className="flex gap-3">
              <WagmiButton
                type="button"
                onClick={closeDevModal}
                variant="outline"
                theme="gray"
                size="lg"
                className="flex-1"
              >
                Cancel
              </WagmiButton>
              
              <WagmiButton
                type="submit"
                disabled={!devPassword.trim()}
                variant="primary"
                theme="orange"
                size="lg"
                className="flex-1"
              >
                Access Dashboard
              </WagmiButton>
            </div>
          </form>
        </div>
      </StandardModal>

      {/* Household Portfolio Login Modal */}
      <StandardModal
        isOpen={showHouseholdModal}
        onClose={closeHouseholdModal}
        title="Household Portfolio Login"
        size="md"
        theme="blue"
      >
        <div className="space-y-4">
          <p style={{ color: '#A0A0A0', textAlign: 'center' }}>
            Enter household password to access personal portfolio
          </p>

          {/* Household Login Form */}
          <form onSubmit={handleHouseholdLogin} className="space-y-4">
              <WagmiInput
                variant="password"
                label="Household Password"
                placeholder="Enter household password"
                value={householdPassword}
                onChange={(e) => setHouseholdPassword(e.target.value)}
                theme="blue"
                size="md"
                required
                autoFocus
              />
              
              {householdError && (
                <WagmiAlert variant="error" size="md">
                  {householdError}
                </WagmiAlert>
              )}
              
              <div className="flex gap-3">
                <WagmiButton
                  type="button"
                  onClick={closeHouseholdModal}
                  variant="outline"
                  theme="gray"
                  size="lg"
                  className="flex-1"
                >
                  Cancel
                </WagmiButton>
                
                <WagmiButton
                  type="submit"
                  disabled={!householdPassword.trim()}
                  variant="primary"
                  theme="blue"
                  size="lg"
                  className="flex-1"
                >
                  Access Portfolio
                </WagmiButton>
              </div>
            </form>
        </div>
      </StandardModal>
    </div>
    </div>
  );
}
