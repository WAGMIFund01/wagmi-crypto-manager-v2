'use client';

import React from 'react';
import { signIn, useSession } from 'next-auth/react';
import WagmiButton from '@/components/ui/WagmiButton';
import WagmiCard from '@/components/ui/WagmiCard';
import WagmiSpinner from '@/components/ui/WagmiSpinner';

export function LoginForm() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0B0B0B' }}>
        <div className="text-center">
          <WagmiSpinner size="lg" theme="green" showText text="Loading..." centered />
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0B0B0B' }}>
        <WagmiCard variant="default" theme="green" size="lg" className="w-full max-w-md">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Welcome back!</h2>
            <p className="text-gray-300">
              You are signed in as {session.user?.email}
            </p>
            <p className="text-sm text-gray-400">
              Role: {session.user?.role || 'Unknown'}
              {session.user?.investorId && (
                <span className="ml-2">| Investor ID: {session.user.investorId}</span>
              )}
            </p>
            <WagmiButton
              onClick={() => window.location.href = session.user?.role === 'manager' ? '/dashboard' : '/investor'}
              variant="primary"
              theme="green"
              size="lg"
              className="w-full"
            >
              Go to Dashboard
            </WagmiButton>
          </div>
        </WagmiCard>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0B0B0B' }}>
      <WagmiCard variant="default" theme="green" size="lg" className="w-full max-w-md">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              WAGMI Crypto Investment Manager
            </h1>
            <p className="text-gray-300">
              Professional cryptocurrency portfolio tracking platform
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
              Sign in with your Google account to access your portfolio
            </p>
            <WagmiButton
              onClick={() => signIn('google')}
              variant="primary"
              theme="green"
              size="lg"
              className="w-full"
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              }
              iconPosition="left"
            >
              Sign in with Google
            </WagmiButton>
          </div>
        </div>
      </WagmiCard>
    </div>
  );
}
