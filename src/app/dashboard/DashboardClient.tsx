'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

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

  const handleRetryKPI = async () => {
    setIsRetrying(true);
    try {
      // Call revalidation API to clear cache
      const response = await fetch('/api/revalidate-kpi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Reload page after successful revalidation
        window.location.reload();
      } else {
        throw new Error('Failed to revalidate dashboard');
      }
    } catch (error) {
      console.error('Error retrying KPI data:', error);
      setIsRetrying(false);
    }
  };

  // Use dev session if in dev mode, otherwise use OAuth session
  const currentSession = isDevMode ? devSession : session;

  // Format timestamp for display from Google Sheets data
  const formatLastRefresh = (timestamp: string) => {
    if (!timestamp || timestamp.trim() === '') return 'Unknown';
    
    console.log('Raw timestamp from Google Sheets:', timestamp);
    
    try {
      let date: Date;
      
      // Check if it's an Excel serial number (Google Sheets converts dates to this)
      const serialNumber = parseFloat(timestamp);
      if (!isNaN(serialNumber) && serialNumber > 0) {
        // Excel serial date: days since January 1, 1900
        // Google Sheets uses 1899-12-30 as epoch (Excel uses 1900-01-01)
        const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
        date = new Date(excelEpoch.getTime() + (serialNumber * 24 * 60 * 60 * 1000));
        console.log('Converted Excel serial date:', serialNumber, 'to:', date);
      } else {
        // Try parsing as regular date string
        date = new Date(timestamp);
        
        // If that fails, try common Google Sheets formats
        if (isNaN(date.getTime())) {
          // Try replacing hyphens with slashes (more compatible)
          const normalizedTimestamp = timestamp.replace(/-/g, '/');
          date = new Date(normalizedTimestamp);
        }
        
        // If still fails, try parsing the specific format
        if (isNaN(date.getTime())) {
          // Handle format: "2024-01-15 14:30:00"
          const match = timestamp.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
          if (match) {
            const [, year, month, day, hour, minute, second] = match;
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
          }
        }
      }
      
      if (isNaN(date.getTime())) {
        console.error('Could not parse timestamp:', timestamp);
        return 'Invalid date';
      }
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error parsing timestamp:', error, 'Timestamp:', timestamp);
      return 'Invalid date';
    }
  };

  // Format KPI data with privacy mode (only if we have data)
  const formattedKpiData = kpiData ? {
    activeInvestors: isPrivacyMode ? '•••' : kpiData.activeInvestors,
    totalAUM: isPrivacyMode ? '••••••' : kpiData.totalAUM,
    cumulativeReturn: isPrivacyMode ? '•••' : kpiData.cumulativeReturn,
    monthOnMonth: isPrivacyMode ? '•••' : kpiData.monthOnMonth
  } : null;

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

  return (
    <div style={{ backgroundColor: '#0B0B0B' }}>
      {/* Navigation Header - Option D: Two-Row Navbar with Clear Separation */}
      <header style={{ backgroundColor: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Row 1 - Brand + Controls */}
          <div className="flex justify-between items-center h-18 py-4">
            {/* Left - WAGMI Logo */}
            <div className="flex items-center">
              <h1 
                className="font-bold"
                style={{ 
                  color: '#00FF95',
                  fontSize: '36px',
                  lineHeight: '1.2',
                  textShadow: '0 0 25px rgba(0, 255, 149, 0.6), 0 0 50px rgba(0, 255, 149, 0.4), 0 0 75px rgba(0, 255, 149, 0.2)',
                  letterSpacing: '0.05em'
                }}
              >
                WAGMI
              </h1>
            </div>
            
            {/* Right - Controls */}
            <div className="flex items-center space-x-4">
              {/* Last Updated Timestamp */}
              <p className="mr-8" style={{ color: '#A0A0A0', fontSize: '12px', margin: 0 }}>
                Last updated: {formatLastRefresh(kpiData?.lastUpdated || '')}
              </p>
              
              {/* Refresh Icon */}
              <button
                onClick={handleRetryKPI}
                disabled={isRetrying}
                className="p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: isRetrying ? 'rgba(0, 255, 149, 0.3)' : 'transparent',
                  border: '1px solid #00FF95',
                  color: '#00FF95',
                  width: '28px',
                  height: '28px',
                  opacity: isRetrying ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isRetrying) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.1)';
                    e.currentTarget.style.boxShadow = '0px 0px 8px rgba(0, 255, 149, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRetrying) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                title="Manual refresh"
              >
                {isRetrying ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2" style={{ borderColor: '#00FF95' }}></div>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                )}
              </button>

              {/* Privacy Toggle - Eye Icon with Rounded Square */}
              <button
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className="p-1.5 rounded-md transition-all duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: isPrivacyMode ? '#00FF95' : 'transparent',
                  border: '1px solid #00FF95',
                  color: isPrivacyMode ? '#1A1A1A' : '#00FF95',
                  width: '28px',
                  height: '28px'
                }}
                onMouseEnter={(e) => {
                  if (!isPrivacyMode) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.1)';
                    e.currentTarget.style.boxShadow = '0px 0px 8px rgba(0, 255, 149, 0.3)';
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
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  // Open eye icon (privacy OFF)
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                )}
              </button>

              {/* Exit Dev Mode Button - Icon Only */}
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #00FF95',
                  color: '#00FF95',
                  width: '28px',
                  height: '28px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.1)';
                  e.currentTarget.style.boxShadow = '0px 0px 8px rgba(0, 255, 149, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title={isDevMode ? 'Exit Dev Mode' : 'Sign Out'}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Row 2 - Navigation Tabs + KPI Ribbon */}
          <div className="flex items-center justify-between h-16 py-3" style={{ borderBottom: '1px solid #333' }}>
            {/* Left - Navigation Tabs */}
            <nav className="flex space-x-8">
              {[
                { id: 'portfolio', label: 'Portfolio Overview' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'investors', label: 'Investors' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="py-2 px-1 text-sm font-medium transition-all duration-200 relative"
                  style={{
                    color: activeTab === tab.id ? '#00FF95' : '#A0A0A0',
                    borderBottom: activeTab === tab.id ? '2px solid #00FF95' : '2px solid transparent',
                    textShadow: activeTab === tab.id ? '0 0 10px rgba(0, 255, 149, 0.5)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.textShadow = '0 0 5px rgba(0, 255, 149, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = '#A0A0A0';
                      e.currentTarget.style.textShadow = 'none';
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right - KPI Ribbon */}
            <div className="flex items-center space-x-6">
              {hasError ? (
                /* Error State */
                <div className="flex items-center space-x-3">
                  {/* Error Icon */}
                  <div 
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: 'rgba(255, 107, 107, 0.1)',
                      border: '1px solid #FF6B6B'
                    }}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FF6B6B' }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  
                  {/* Error Message */}
                  <div>
                    <p style={{ color: '#FF6B6B', fontSize: '12px', fontWeight: '600', margin: 0 }}>
                      KPI Data Unavailable
                    </p>
                  </div>
                </div>
              ) : (
                /* KPI Data - Four evenly spaced metrics */
                <>
                  {/* Active Investors */}
                  <div className="text-center" style={{ minWidth: '80px' }}>
                    <p style={{ color: '#A0A0A0', fontSize: '9px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>
                      Active Investors
                    </p>
                    <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', margin: '2px 0 0 0' }}>
                      {formattedKpiData?.activeInvestors || '--'}
                    </p>
                  </div>

                  {/* Total AUM */}
                  <div className="text-center" style={{ minWidth: '80px' }}>
                    <p style={{ color: '#A0A0A0', fontSize: '9px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>
                      Total AUM
                    </p>
                    <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', margin: '2px 0 0 0' }}>
                      {formattedKpiData?.totalAUM || '--'}
                    </p>
                  </div>

                  {/* Cumulative Return */}
                  <div className="text-center" style={{ minWidth: '80px' }}>
                    <p style={{ color: '#A0A0A0', fontSize: '9px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>
                      Cumulative Return
                    </p>
                    <p style={{ 
                      color: formattedKpiData?.cumulativeReturn?.startsWith('+') ? '#00FF95' : '#FF4D4D', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      margin: '2px 0 0 0' 
                    }}>
                      {formattedKpiData?.cumulativeReturn || '--'}
                    </p>
                  </div>

                  {/* Month-on-Month */}
                  <div className="text-center" style={{ minWidth: '80px' }}>
                    <p style={{ color: '#A0A0A0', fontSize: '9px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>
                      Month-on-Month
                    </p>
                    <p style={{ 
                      color: formattedKpiData?.monthOnMonth?.startsWith('+') ? '#00FF95' : '#FF4D4D', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      margin: '2px 0 0 0' 
                    }}>
                      {formattedKpiData?.monthOnMonth || '--'}
                    </p>
                  </div>
                </>
              )}
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
