'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UniversalNavbar from '@/components/UniversalNavbar';
import AICopilot from '@/components/AICopilot';
import { WagmiSpinner } from '@/components/ui';
import { COLORS } from '@/shared/constants/colors';

interface Session {
  user?: {
    role?: "manager" | "investor" | "unauthorized";
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

interface AICopilotClientProps {
  session: Session | null;
}

export default function AICopilotClient({ session }: AICopilotClientProps) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [devSession, setDevSession] = useState(null);
  const [isDevMode, setIsDevMode] = useState(false);

  // Check for dev mode
  useEffect(() => {
    const devModeEnabled = process.env.NODE_ENV === 'development' && 
                          (process.env.NEXT_PUBLIC_DEV_MODE === 'true' || 
                           typeof window !== 'undefined' && window.localStorage.getItem('devMode') === 'true');
    setIsDevMode(devModeEnabled);

    if (devModeEnabled && !session) {
      setDevSession({
        user: {
          email: 'dev@example.com',
          name: 'Dev User',
          role: 'manager' as const
        }
      } as any);
    }
    
    setIsCheckingAuth(false);
  }, [session]);

  const effectiveSession = session || devSession;

  // Handle unauthorized access
  useEffect(() => {
    if (!isCheckingAuth && !effectiveSession) {
      router.push('/login');
    } else if (!isCheckingAuth && effectiveSession?.user?.role === 'unauthorized') {
      router.push('/login');
    }
  }, [isCheckingAuth, effectiveSession, router]);

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background.primary }}>
        <WagmiSpinner size="lg" />
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!effectiveSession || effectiveSession.user?.role === 'unauthorized') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.background.primary }}>
      <UniversalNavbar 
        activeTab="ai-copilot"
        onTabChange={() => {}}
        dataSource="wagmi-fund"
      />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
              AI Copilot
            </h1>
            <p className="mt-2" style={{ color: COLORS.text.secondary }}>
              Generate professional investor reports with AI assistance
            </p>
          </div>

          {/* Main Content */}
          <div className="h-[calc(100vh-220px)]">
            <AICopilot />
          </div>
        </div>
      </main>
    </div>
  );
}

