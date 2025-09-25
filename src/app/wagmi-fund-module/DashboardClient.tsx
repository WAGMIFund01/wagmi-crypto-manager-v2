'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import UniversalNavbar from '@/components/UniversalNavbar';
import PortfolioOverview from '@/components/tabs/PortfolioOverview';
import Analytics from '@/components/tabs/Analytics';
import Investors from '@/components/tabs/Investors';
import { COLORS } from '@/shared/constants/colors';

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

export default function DashboardClient({ session, kpiData: initialKpiData, hasError }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Detect module based on pathname
  const dataSource = pathname.includes('/personal-portfolio') ? 'personal-portfolio' : 'wagmi-fund';
  const [devSession, setDevSession] = useState(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [kpiData, setKpiData] = useState(dataSource === 'personal-portfolio' ? null : initialKpiData);

  // Initialize active tab from URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    const availableTabs = dataSource === 'personal-portfolio' ? ['portfolio', 'analytics'] : ['portfolio', 'analytics', 'investors'];
    if (tab && availableTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
    // Update URL with tab parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Handle privacy mode change
  const handlePrivacyModeChange = (privacyMode: boolean) => {
    setIsPrivacyMode(privacyMode);
  };

  // Create refresh function that triggers all data refreshes
  const triggerDataRefresh = () => {
    console.log('Data refresh triggered');
    // Also trigger KPI data refresh to update AUM ribbon
    handleKpiRefresh();
  };

  // Handle comprehensive data refresh
  const handleKpiRefresh = async () => {
    try {
      // Fetch fresh KPI data from the API with force refresh to bypass caching
      const response = await fetch('/api/kpi-data?force=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (response.ok) {
        const freshKpiData = await response.json();
        console.log('🔍 DEBUG - Fresh KPI data received:', freshKpiData);
        console.log('🔍 DEBUG - lastUpdated from API:', freshKpiData.lastUpdated);
        
        // Transform the data to match the expected format
        const transformedKpiData = {
          activeInvestors: freshKpiData.totalInvestors.toString(),
          totalAUM: `$${freshKpiData.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          cumulativeReturn: `${freshKpiData.cumulativeReturn >= 0 ? '+' : ''}${freshKpiData.cumulativeReturn.toFixed(1)}%`,
          monthOnMonth: `${freshKpiData.monthlyReturn >= 0 ? '+' : ''}${freshKpiData.monthlyReturn.toFixed(1)}%`,
          lastUpdated: freshKpiData.lastUpdated
        };
        
        console.log('🔍 DEBUG - Transformed KPI data:', transformedKpiData);
        setKpiData(transformedKpiData);
        console.log('KPI data refreshed successfully');
        
        // Don't trigger portfolio refresh here to avoid infinite loop
      } else {
        console.error('Failed to fetch fresh KPI data');
      }
    } catch (error) {
      console.error('Error refreshing KPI data:', error);
    }
  };

  // Use dev session if in dev mode, otherwise use OAuth session
  const currentSession = isDevMode ? devSession : session;

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0B0B0B' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: COLORS.primary.green }}></div>
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
        return <PortfolioOverview onRefresh={triggerDataRefresh} isPrivacyMode={isPrivacyMode} dataSource={dataSource} />;
      case 'analytics':
        // For personal portfolio, skip analytics for now
        if (dataSource === 'personal-portfolio') {
          return <div className="text-center py-8"><p className="text-gray-400">Analytics coming soon for personal portfolio</p></div>;
        }
        return <Analytics onRefresh={triggerDataRefresh} />;
      case 'investors':
        // Only show investors for WAGMI fund
        if (dataSource === 'personal-portfolio') {
          return <div className="text-center py-8"><p className="text-gray-400">Investors tab not available for personal portfolio</p></div>;
        }
        return <Investors isPrivacyMode={isPrivacyMode} onRefresh={triggerDataRefresh} />;
      default:
        return <PortfolioOverview onRefresh={triggerDataRefresh} isPrivacyMode={isPrivacyMode} dataSource={dataSource} />;
    }
  };

  return (
    <div style={{ backgroundColor: '#0B0B0B' }}>
      {/* Universal Navbar */}
      <UniversalNavbar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onPrivacyModeChange={handlePrivacyModeChange}
        kpiData={kpiData}
        hasError={hasError}
        onKpiRefresh={handleKpiRefresh}
        dataSource={dataSource}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}