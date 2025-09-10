'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// Removed unused imports - using custom styled components instead

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [devSession, setDevSession] = useState(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [kpiData, setKpiData] = useState({
    activeInvestors: '6',
    totalAUM: '$21,684.25',
    cumulativeReturn: '+21.1%',
    monthOnMonth: '-7.8%'
  });
  const [isLoadingKPI, setIsLoadingKPI] = useState(false);
  const [kpiError, setKpiError] = useState('');

  useEffect(() => {
    // Check for dev mode session
    const devSessionData = sessionStorage.getItem('devSession');
    const devMode = sessionStorage.getItem('isDevMode');
    
    if (devMode === 'true' && devSessionData) {
      try {
        const parsedDevSession = JSON.parse(devSessionData);
        setDevSession(parsedDevSession);
        setIsDevMode(true);
        return; // Skip OAuth session checks in dev mode
      } catch (error) {
        console.error('Error parsing dev session:', error);
        // Clear invalid dev session
        sessionStorage.removeItem('devSession');
        sessionStorage.removeItem('isDevMode');
      }
    }

    // Regular OAuth session checks
    if (status === 'loading') return;
    
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
  }, [session, status, router]);

  const handleSignOut = () => {
    if (isDevMode) {
      // Clear dev session
      sessionStorage.removeItem('devSession');
      sessionStorage.removeItem('isDevMode');
      setDevSession(null);
      setIsDevMode(false);
      router.push('/');
    } else {
      // Regular OAuth sign out
      signOut({ callbackUrl: '/' });
    }
  };

  // Use dev session if in dev mode, otherwise use OAuth session
  const currentSession = isDevMode ? devSession : session;

  // Format timestamp for display
  const formatLastRefresh = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Fetch KPI data from Google Sheets
  const fetchKPIData = async () => {
    setIsLoadingKPI(true);
    setKpiError('');
    
    try {
      const response = await fetch('/api/get-kpi-data');
      const data = await response.json();
      
      if (data.success && data.kpiData) {
        // Transform the data to match our expected format
        const transformedData = {
          activeInvestors: data.kpiData.totalInvestors?.toString() || '0',
          totalAUM: data.kpiData.totalAUM ? `$${parseFloat(data.kpiData.totalAUM).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00',
          cumulativeReturn: data.kpiData.cumulativeReturn ? `+${parseFloat(data.kpiData.cumulativeReturn).toFixed(1)}%` : '+0.0%',
          monthOnMonth: data.kpiData.monthlyReturn ? `${parseFloat(data.kpiData.monthlyReturn) >= 0 ? '+' : ''}${parseFloat(data.kpiData.monthlyReturn).toFixed(1)}%` : '+0.0%'
        };
        
        setKpiData(transformedData);
        setLastRefreshTime(new Date());
      } else {
        throw new Error(data.error || 'Failed to fetch KPI data');
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setKpiError(error instanceof Error ? error.message : 'Failed to load KPI data');
    } finally {
      setIsLoadingKPI(false);
    }
  };

  // Load KPI data on component mount
  useEffect(() => {
    fetchKPIData();
  }, []);

  // Format KPI data with privacy mode
  const formattedKpiData = {
    activeInvestors: isPrivacyMode ? '•••' : kpiData.activeInvestors,
    totalAUM: isPrivacyMode ? '••••••' : kpiData.totalAUM,
    cumulativeReturn: isPrivacyMode ? '•••' : kpiData.cumulativeReturn,
    monthOnMonth: isPrivacyMode ? '•••' : kpiData.monthOnMonth
  };

  if (status === 'loading' && !isDevMode) {
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

  return (
    <div style={{ backgroundColor: '#0B0B0B' }}>
      {/* Navigation Header */}
      <header style={{ backgroundColor: '#0B0B0B', borderBottom: '1px solid #333' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row - Logo and Controls */}
          <div className="flex justify-between items-center h-16">
            {/* Left - WAGMI Logo */}
            <div className="flex items-center" style={{ paddingLeft: '32px' }}>
              <h1 
                className="font-bold"
                style={{ 
                  color: '#00FF95',
                  fontSize: '32px',
                  lineHeight: '1.2',
                  textShadow: '0 0 25px rgba(0, 255, 149, 0.6), 0 0 50px rgba(0, 255, 149, 0.4), 0 0 75px rgba(0, 255, 149, 0.2)',
                  letterSpacing: '0.05em'
                }}
              >
                WAGMI
              </h1>
            </div>
            
            {/* Right - Controls */}
            <div className="flex items-center gap-4">
              {/* Privacy Toggle */}
              <button
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: isPrivacyMode ? '#00FF95' : 'transparent',
                  border: '1px solid #00FF95',
                  color: isPrivacyMode ? '#1A1A1A' : '#00FF95',
                  width: '40px',
                  height: '40px'
                }}
                onMouseEnter={(e) => {
                  if (!isPrivacyMode) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.1)';
                    e.currentTarget.style.boxShadow = '0px 0px 10px rgba(0, 255, 149, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPrivacyMode) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isPrivacyMode ? (
                  // Eye with slash icon (privacy ON)
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  // Open eye icon (privacy OFF)
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                )}
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="font-semibold py-2 px-4 rounded-lg transition-all duration-200"
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
                {isDevMode ? 'Exit Dev Mode' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-gray-700">
            <nav className="flex space-x-8" style={{ paddingLeft: '32px' }}>
              {[
                { id: 'portfolio', label: 'Portfolio Overview' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'investors', label: 'Investors' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="py-4 px-1 text-sm font-medium transition-colors duration-200 relative"
                  style={{
                    color: activeTab === tab.id ? '#00FF95' : '#A0A0A0',
                    borderBottom: activeTab === tab.id ? '2px solid #00FF95' : '2px solid transparent'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* KPI Ribbon */}
          <div className="flex items-center justify-between py-4 border-b border-gray-700">
            {kpiError ? (
              /* Error State */
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p style={{ color: '#FF6B6B', fontSize: '14px', margin: 0 }}>
                    ⚠️ Error loading KPI data
                  </p>
                  <p style={{ color: '#A0A0A0', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {kpiError}
                  </p>
                </div>
                <button
                  onClick={fetchKPIData}
                  className="px-3 py-1 text-xs font-medium rounded transition-all duration-200"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #00FF95',
                    color: '#00FF95'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Retry
                </button>
              </div>
            ) : (
              /* KPI Data */
              <div className="flex items-center space-x-8">
                {/* Active Investors */}
                <div className="text-center">
                  <p style={{ color: '#A0A0A0', fontSize: '12px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active investors
                  </p>
                  <p style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '600', margin: '4px 0 0 0' }}>
                    {isLoadingKPI ? '...' : formattedKpiData.activeInvestors}
                  </p>
                </div>

                {/* Separator */}
                <div style={{ width: '1px', height: '32px', backgroundColor: '#333' }}></div>

                {/* Total AUM */}
                <div className="text-center">
                  <p style={{ color: '#A0A0A0', fontSize: '12px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total AUM
                  </p>
                  <p style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '600', margin: '4px 0 0 0' }}>
                    {isLoadingKPI ? '...' : formattedKpiData.totalAUM}
                  </p>
                </div>

                {/* Separator */}
                <div style={{ width: '1px', height: '32px', backgroundColor: '#333' }}></div>

                {/* Cumulative Return */}
                <div className="text-center">
                  <p style={{ color: '#A0A0A0', fontSize: '12px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Cumulative Return
                  </p>
                  <p style={{ 
                    color: formattedKpiData.cumulativeReturn.startsWith('+') ? '#00FF95' : '#FF6B6B', 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    margin: '4px 0 0 0' 
                  }}>
                    {isLoadingKPI ? '...' : formattedKpiData.cumulativeReturn}
                  </p>
                </div>

                {/* Separator */}
                <div style={{ width: '1px', height: '32px', backgroundColor: '#333' }}></div>

                {/* Month-on-Month */}
                <div className="text-center">
                  <p style={{ color: '#A0A0A0', fontSize: '12px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Month-on-Month
                  </p>
                  <p style={{ 
                    color: formattedKpiData.monthOnMonth.startsWith('+') ? '#00FF95' : '#FF6B6B', 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    margin: '4px 0 0 0' 
                  }}>
                    {isLoadingKPI ? '...' : formattedKpiData.monthOnMonth}
                  </p>
                </div>
              </div>
            )}

            {/* Last Updated Timestamp */}
            <div className="text-right">
              <p style={{ color: '#A0A0A0', fontSize: '12px', margin: 0 }}>
                Last updated: {formatLastRefresh(lastRefreshTime)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <h2 
              className="text-2xl font-bold"
              style={{ 
                color: '#00FF95',
                textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
              }}
            >
              Portfolio Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Portfolio Cards will go here */}
              <div 
                className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)]"
                style={{ 
                  backgroundColor: '#1A1F1A',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
                }}
              >
                <div className="space-y-4">
                  <h3 
                    className="text-lg font-semibold"
                    style={{ 
                      color: '#00FF95',
                      textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
                    }}
                  >
                    Portfolio Summary
                  </h3>
                  <p style={{ color: '#E0E0E0', fontSize: '14px', lineHeight: '1.5' }}>
                    View and manage all investor portfolios with real-time performance metrics
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 
              className="text-2xl font-bold"
              style={{ 
                color: '#00FF95',
                textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
              }}
            >
              Analytics & Reports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Analytics Cards will go here */}
              <div 
                className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)]"
                style={{ 
                  backgroundColor: '#1A1F1A',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
                }}
              >
                <div className="space-y-4">
                  <h3 
                    className="text-lg font-semibold"
                    style={{ 
                      color: '#00FF95',
                      textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
                    }}
                  >
                    Performance Analytics
                  </h3>
                  <p style={{ color: '#E0E0E0', fontSize: '14px', lineHeight: '1.5' }}>
                Generate comprehensive performance reports and analytics dashboards
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investors' && (
          <div className="space-y-6">
            <h2 
              className="text-2xl font-bold"
              style={{ 
                color: '#00FF95',
                textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
              }}
            >
              Investor Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Investor Cards will go here */}
              <div 
                className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)]"
                style={{ 
                  backgroundColor: '#1A1F1A',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
                }}
              >
                <div className="space-y-4">
                  <h3 
                    className="text-lg font-semibold"
                    style={{ 
                      color: '#00FF95',
                      textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
                    }}
                  >
                    Investor List
                  </h3>
                  <p style={{ color: '#E0E0E0', fontSize: '14px', lineHeight: '1.5' }}>
                Add new investors, manage access permissions, and update investor data
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
