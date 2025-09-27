'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import UniversalNavbar from '@/components/UniversalNavbar';
import PortfolioOverview from '@/components/tabs/PortfolioOverview';
import Analytics from '@/components/tabs/Analytics';
import Investors from '@/components/tabs/Investors';
import PerformanceDashboard from '@/components/PerformanceDashboard';
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
    activeInvestors?: string;
    totalAUM: string;
    cumulativeReturn?: string;
    monthOnMonth?: string;
    lastUpdated: string;
  } | null;
  hasError: boolean;
  dataSource?: 'wagmi-fund' | 'personal-portfolio' | 'performance-dashboard';
}

export default function DashboardClient({ session, kpiData: initialKpiData, hasError, dataSource = 'wagmi-fund' }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [devSession, setDevSession] = useState(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [kpiData, setKpiData] = useState(initialKpiData);

  // Debug logging
  console.log('DashboardClient - initialKpiData:', initialKpiData);
  console.log('DashboardClient - kpiData state:', kpiData);
  console.log('DashboardClient - dataSource:', dataSource);
  console.log('DashboardClient - activeTab:', activeTab);

  // Ensure kpiData is set correctly on mount
  useEffect(() => {
    if (initialKpiData && !kpiData) {
      console.log('Setting kpiData from initialKpiData:', initialKpiData);
      setKpiData(initialKpiData);
    }
  }, [initialKpiData, kpiData]);

  // Data source is now passed as a prop from the parent component

  // Initialize active tab from URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    const allowedTabs = dataSource === 'personal-portfolio' 
      ? ['portfolio'] 
      : dataSource === 'performance-dashboard'
      ? ['performance']
      : ['portfolio', 'analytics', 'investors'];
    
    if (tab && allowedTabs.includes(tab)) {
      setActiveTab(tab);
    } else if (dataSource === 'personal-portfolio' && tab && !allowedTabs.includes(tab)) {
      // Force portfolio tab for Personal Portfolio if invalid tab is requested
      setActiveTab('portfolio');
    } else if (dataSource === 'performance-dashboard' && tab && !allowedTabs.includes(tab)) {
      // Force performance tab for Performance Dashboard if invalid tab is requested
      setActiveTab('performance');
    } else if (!tab) {
      // Set default tab when no tab parameter is present
      if (dataSource === 'personal-portfolio') {
        setActiveTab('portfolio');
      } else if (dataSource === 'performance-dashboard') {
        setActiveTab('performance');
      } else {
        setActiveTab('portfolio'); // Default for WAGMI Fund
      }
    }
  }, [searchParams, dataSource]);

  useEffect(() => {
    // Check for dev mode session
    const devSessionData = sessionStorage.getItem('devSession');
    const devMode = sessionStorage.getItem('isDevMode');
    
    console.log('Auth check - devMode:', devMode, 'devSessionData:', devSessionData ? 'exists' : 'null', 'session:', session ? 'exists' : 'null');
    
    if (devMode === 'true' && devSessionData) {
      try {
        const parsedDevSession = JSON.parse(devSessionData);
        console.log('Setting dev session:', parsedDevSession);
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
      console.log('No session found, redirecting to /');
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
    // Validate tab access based on dataSource
    const allowedTabs = dataSource === 'personal-portfolio' 
      ? ['portfolio'] 
      : dataSource === 'performance-dashboard'
      ? ['performance']
      : ['portfolio', 'analytics', 'investors'];
    
    if (!allowedTabs.includes(tabId)) {
      console.warn(`Tab ${tabId} not allowed for ${dataSource} module`);
      return;
    }
    
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
      // First, update all prices in the database
      console.log(`🔄 Updating prices for ${dataSource}...`);
      const priceUpdateResponse = await fetch('/api/update-all-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataSource }),
      });

      if (priceUpdateResponse.ok) {
        const priceUpdateResult = await priceUpdateResponse.json();
        console.log('✅ Price update completed:', priceUpdateResult);
      } else {
        console.warn('⚠️ Price update failed, continuing with KPI refresh...');
      }

      // Then, determine API endpoint based on data source
      const apiEndpoint = dataSource === 'personal-portfolio' 
        ? '/api/get-personal-portfolio-kpi' 
        : '/api/kpi-data?force=true';
      
      console.log(`🔄 Refreshing KPI data for ${dataSource} from ${apiEndpoint}`);
      
      // Fetch fresh KPI data from the appropriate API
      const response = await fetch(apiEndpoint, {
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
        
        // Transform the data based on data source
        let transformedKpiData;
        
        if (dataSource === 'personal-portfolio') {
          // Personal Portfolio: Only show AUM and lastUpdated
          transformedKpiData = {
            activeInvestors: undefined, // Will be hidden by UniversalNavbar
            totalAUM: `$${freshKpiData.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            cumulativeReturn: undefined, // Will be hidden by UniversalNavbar
            monthOnMonth: undefined, // Will be hidden by UniversalNavbar
            lastUpdated: freshKpiData.lastUpdated
          };
        } else {
          // WAGMI Fund: Show all KPIs
          transformedKpiData = {
            activeInvestors: freshKpiData.totalInvestors.toString(),
            totalAUM: `$${freshKpiData.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            cumulativeReturn: `${freshKpiData.cumulativeReturn >= 0 ? '+' : ''}${freshKpiData.cumulativeReturn.toFixed(1)}%`,
            monthOnMonth: `${freshKpiData.monthlyReturn >= 0 ? '+' : ''}${freshKpiData.monthlyReturn.toFixed(1)}%`,
            lastUpdated: freshKpiData.lastUpdated
          };
        }
        
        console.log('🔍 DEBUG - Transformed KPI data:', transformedKpiData);
        setKpiData(transformedKpiData);
        console.log(`KPI data refreshed successfully for ${dataSource}`);
        
        // Don't trigger portfolio refresh here to avoid infinite loop
      } else {
        console.error(`Failed to fetch fresh KPI data from ${apiEndpoint}`);
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
    console.log('renderTabContent - activeTab:', activeTab, 'dataSource:', dataSource);
    switch (activeTab) {
      case 'portfolio':
        console.log('Rendering PortfolioOverview');
        return <PortfolioOverview onRefresh={triggerDataRefresh} isPrivacyMode={isPrivacyMode} dataSource={dataSource} />;
      case 'analytics':
        console.log('Rendering Analytics');
        return <Analytics onRefresh={triggerDataRefresh} dataSource={dataSource} />;
      case 'investors':
        console.log('Rendering Investors');
        return <Investors isPrivacyMode={isPrivacyMode} onRefresh={triggerDataRefresh} dataSource={dataSource} />;
      case 'performance':
        console.log('Rendering PerformanceDashboard');
        return <PerformanceDashboard />;
      default:
        console.log('Default case - dataSource:', dataSource);
        // Default behavior based on dataSource
        if (dataSource === 'performance-dashboard') {
          console.log('Default: Rendering PerformanceDashboard');
          return <PerformanceDashboard />;
        } else {
          console.log('Default: Rendering PortfolioOverview');
          return <PortfolioOverview onRefresh={triggerDataRefresh} isPrivacyMode={isPrivacyMode} dataSource={dataSource} />;
        }
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