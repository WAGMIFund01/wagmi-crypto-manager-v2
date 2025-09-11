'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import WagmiButton from './ui/WagmiButton';
import { RefreshIcon } from './ui/icons/WagmiIcons';

interface UniversalNavbarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onPrivacyModeChange?: (isPrivacyMode: boolean) => void;
  kpiData?: {
    activeInvestors: string;
    totalAUM: string;
    cumulativeReturn: string;
    monthOnMonth: string;
    lastUpdated: string;
  } | null;
  hasError?: boolean;
}

export default function UniversalNavbar({ 
  activeTab, 
  onTabChange, 
  onPrivacyModeChange,
  kpiData = null, 
  hasError = false 
}: UniversalNavbarProps) {
  const router = useRouter();
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const handleSignOut = () => {
    // Clear dev session (only on client side)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('devSession');
      sessionStorage.removeItem('isDevMode');
    }
    router.push('/');
  };

  // Format timestamp for display from Google Sheets data
  const formatLastRefresh = (timestamp: string) => {
    if (!timestamp || timestamp.trim() === '') return 'Unknown';
    
    try {
      let date: Date;
      
      // Check if it's an Excel serial number (Google Sheets converts dates to this)
      const serialNumber = parseFloat(timestamp);
      if (!isNaN(serialNumber) && serialNumber > 0) {
        // Excel serial date: days since January 1, 1900
        // Google Sheets uses 1899-12-30 as epoch (Excel uses 1900-01-01)
        const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
        date = new Date(excelEpoch.getTime() + (serialNumber * 24 * 60 * 60 * 1000));
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
        return 'Invalid date';
      }
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format KPI data with privacy mode (only if we have data)
  const formattedKpiData = kpiData ? {
    activeInvestors: isPrivacyMode ? '•••••' : kpiData.activeInvestors,
    totalAUM: isPrivacyMode ? '•••••' : kpiData.totalAUM,
    cumulativeReturn: kpiData.cumulativeReturn, // No masking for return metrics
    monthOnMonth: kpiData.monthOnMonth // No masking for return metrics
  } : null;

  // Show loading state during hydration
  if (!isClient) {
    return (
      <header style={{ backgroundColor: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 py-4">
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
            <div className="flex items-center space-x-4">
              <div style={{ color: '#A0A0A0', fontSize: '12px' }}>Loading...</div>
            </div>
          </div>
          <div className="flex items-center justify-between h-16 py-3" style={{ borderBottom: '1px solid #333' }}>
            <nav className="flex space-x-8">
              <div style={{ color: '#A0A0A0', fontSize: '14px' }}>Loading navigation...</div>
            </nav>
            <div className="flex items-center space-x-6">
              <div style={{ color: '#A0A0A0', fontSize: '12px' }}>Loading KPI data...</div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header style={{ backgroundColor: '#1A1A1A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row 1 - Brand + Controls */}
        <div className="flex justify-between items-center h-18 py-4">
          {/* Left - WAGMI Logo */}
          <div className="flex items-center">
            <h1 
              className="font-bold cursor-pointer"
              onClick={() => onTabChange('portfolio')}
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
            <p className="mr-8" style={{ color: '#A0A0A0', fontSize: '12px' }}>
              Last updated: {formatLastRefresh(kpiData?.lastUpdated || '')}
            </p>
            
            {/* Refresh Icon */}
            <WagmiButton
              onClick={handleRetryKPI}
              disabled={isRetrying}
              variant="outline"
              theme="green"
              size="sm"
              icon={<RefreshIcon className="w-3 h-3" />}
              loading={isRetrying}
              className="w-7 h-7"
              title="Manual refresh"
            />

            {/* Privacy Toggle - Eye Icon with Rounded Square */}
            <WagmiButton
              onClick={() => {
                const newPrivacyMode = !isPrivacyMode;
                setIsPrivacyMode(newPrivacyMode);
                onPrivacyModeChange?.(newPrivacyMode);
              }}
              variant={isPrivacyMode ? "primary" : "outline"}
              theme="green"
              size="sm"
              className="w-7 h-7"
              icon={
                isPrivacyMode ? (
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
                )
              }
              title={isPrivacyMode ? 'Show Data' : 'Privacy Mode'}
            />

            {/* Exit Dev Mode Button - Icon Only */}
            <WagmiButton
              onClick={handleSignOut}
              variant="outline"
              theme="green"
              size="sm"
              className="w-7 h-7"
              icon={
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              }
              title="Exit Dev Mode"
            />
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
                onClick={() => onTabChange(tab.id)}
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

                {/* MoM Return */}
                <div className="text-center" style={{ minWidth: '80px' }}>
                  <p style={{ color: '#A0A0A0', fontSize: '9px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>
                    MoM Return
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
  );
}
