'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UniversalNavbar from '@/components/UniversalNavbar';
import PortfolioOverview from '@/components/tabs/PortfolioOverview';
import Analytics from '@/components/tabs/Analytics';
import Investors from '@/components/tabs/Investors';

interface Session {
  user?: {
    role?: "manager" | "investor" | "unauthorized";
    email?: string | null;
    name?: string | null;
    image?: string | null;
    investorId?: string;
  };
}

interface DashboardClientProps {
  session: Session | null;
  kpiData: {
    activeInvestors: string;
    totalAUM: string;
    cumulativeReturn: string;
    monthOnMonth: string;
    lastUpdated: string;
  } | null;
  hasError: boolean;
}

export default function DashboardClient({ session, kpiData, hasError }: DashboardClientProps) {
  const router = useRouter();
  const [devSession, setDevSession] = useState(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check for dev mode session
    const devSessionData = sessionStorage.getItem('devSession');
    const devMode = sessionStorage.getItem('isDevMode');
    
    if (devMode === 'true' && devSessionData) {
      try {
        const parsedDevSession = JSON.parse(devSessionData);
        setDevSession(parsedDevSession);
        setIsDevMode(true);
        setIsCheckingAuth(false);
        return; // Skip OAuth session checks in dev mode
      } catch (error) {
        console.error('Error parsing dev session:', error);
        // Clear invalid dev session
        sessionStorage.removeItem('devSession');
        sessionStorage.removeItem('isDevMode');
      }
    }

    // Regular OAuth session checks
    if (!session) {
      router.push('/');
      return;
    }
    
    if (session.user?.role === 'unauthorized') {
      // Redirect unauthorized users back to homepage
      router.push('/');
      return;
    }
    
    if (session.user?.role !== 'manager') {
      // Redirect non-manager users to investor page or homepage
      router.push('/');
      return;
    }
    
    setIsCheckingAuth(false);
  }, [session, router]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Use dev session if in dev mode, otherwise use OAuth session
  const currentSession = isDevMode ? devSession : session;

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0B0B0B' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#00FF95' }}></div>
          <p style={{ color: '#E0E0E0' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentSession || currentSession.user?.role !== 'manager') {
    return null;
  }

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return <PortfolioOverview />;
      case 'analytics':
        return <Analytics />;
      case 'investors':
        return <Investors />;
      default:
        return <PortfolioOverview />;
    }
  };

  return (
    <div style={{ backgroundColor: '#0B0B0B' }}>
      {/* Universal Navbar */}
      <UniversalNavbar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        kpiData={kpiData}
        hasError={hasError}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}
