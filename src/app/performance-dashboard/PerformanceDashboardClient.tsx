'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PerformanceDashboard from '@/components/PerformanceDashboard';

interface PerformanceDashboardClientProps {
  session: any;
}

export default function PerformanceDashboardClient({ session }: PerformanceDashboardClientProps) {
  const router = useRouter();
  const [devSession, setDevSession] = useState(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for dev session in localStorage (same as other modules)
        const storedDevSession = localStorage.getItem('devSession');
        if (storedDevSession) {
          const parsedSession = JSON.parse(storedDevSession);
          setDevSession(parsedSession);
          setIsDevMode(true);
          setIsCheckingAuth(false);
          return;
        }

        // Check for OAuth session
        if (session) {
          setIsCheckingAuth(false);
          return;
        }

        // No valid session found - redirect to sign in
        router.push('/auth/signin');
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/auth/signin');
      }
    };

    checkAuth();
  }, [session, router]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Use dev session if in dev mode, otherwise use OAuth session
  const currentSession = isDevMode ? devSession : session;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Performance Dashboard</h1>
              <p className="text-gray-400">
                Real-time performance metrics and system health monitoring
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Welcome, {currentSession?.user?.name || currentSession?.user?.email || 'User'}
            </div>
          </div>
        </div>
        
        <PerformanceDashboard />
      </div>
    </div>
  );
}
