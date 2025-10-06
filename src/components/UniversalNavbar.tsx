'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import WagmiButton from './ui/WagmiButton';
import WagmiCard from './ui/WagmiCard';
import { RefreshIcon } from './ui/icons/WagmiIcons';
import { formatTimestampForDisplay } from '@/lib/timestamp-utils';

interface UniversalNavbarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onPrivacyModeChange?: (isPrivacyMode: boolean) => void;
  kpiData?: {
    activeInvestors?: string;
    totalAUM: string;
    cumulativeReturn?: string;
    monthOnMonth?: string;
    lastUpdated: string;
  } | null;
  hasError?: boolean;
  onKpiRefresh?: () => Promise<void>;
  dataSource?: 'wagmi-fund' | 'personal-portfolio' | 'performance-dashboard';
}

export default function UniversalNavbar({ 
  activeTab, 
  onTabChange, 
  onPrivacyModeChange,
  kpiData = null, 
  hasError = false,
  onKpiRefresh,
  dataSource = 'wagmi-fund'
}: UniversalNavbarProps) {
  const router = useRouter();
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<string>('');
  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch the initial timestamp when component mounts and set up auto-polling
  useEffect(() => {
    const fetchInitialTimestamp = async () => {
      try {
        console.log(`Fetching initial timestamp for ${dataSource}...`);
        const timestampEndpoint = dataSource === 'personal-portfolio' 
          ? '/api/get-personal-portfolio-timestamp' 
          : '/api/get-last-updated-timestamp';
          
        const response = await fetch(timestampEndpoint);
        if (response.ok) {
          const data = await response.json();
          console.log('Initial timestamp response:', data);
          if (data.success && data.timestamp) {
            console.log('Setting initial timestamp:', data.timestamp);
            setLastUpdatedTimestamp(data.timestamp);
          }
        }
      } catch (error) {
        console.error('Error fetching initial timestamp:', error);
      }
    };

    // Fetch initial timestamp
    fetchInitialTimestamp();

    // Set up automatic polling every minute (60000ms)
    const interval = setInterval(() => {
      console.log('🔄 Auto-updating timestamp...');
      fetchInitialTimestamp();
    }, 60000); // Update every minute

    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);


  // Function to fetch updated timestamp (can be called after updates)
  const fetchLastUpdatedTimestamp = async () => {
    try {
      const timestampEndpoint = dataSource === 'personal-portfolio' 
        ? '/api/get-personal-portfolio-timestamp' 
        : '/api/get-last-updated-timestamp';
        
      const response = await fetch(timestampEndpoint);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.timestamp) {
          setLastUpdatedTimestamp(data.timestamp);
        }
      }
    } catch (error) {
      console.error('Error fetching updated timestamp:', error);
    }
  };

  const handleRetryKPI = async () => {
    setIsRetrying(true);
    try {
      // Step 1: Update KPI timestamp based on dataSource
      console.log(`Updating KPI timestamp for ${dataSource}...`);
      const timestampEndpoint = dataSource === 'personal-portfolio' 
        ? '/api/update-personal-portfolio-timestamp' 
        : '/api/update-kpi-timestamp';
        
      const timestampUpdateResponse = await fetch(timestampEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!timestampUpdateResponse.ok) {
        throw new Error(`Failed to update ${dataSource} KPI timestamp`);
      }
      
      const timestampUpdateResult = await timestampUpdateResponse.json();
      console.log('Timestamp update result:', timestampUpdateResult);
      
      // Immediately set the timestamp to "Just now" since we just updated it
      // Use UTC time to match our timestamp parsing logic
      const now = new Date();
      const currentTimestamp = `${String(now.getUTCMonth() + 1).padStart(2, '0')}/${String(now.getUTCDate()).padStart(2, '0')}/${now.getUTCFullYear()}, ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
      setLastUpdatedTimestamp(currentTimestamp);
      
      // Step 2: Update prices from CoinGecko
      console.log('Updating prices from CoinGecko...');
      const priceUpdateResponse = await fetch('/api/update-all-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataSource }), // Pass dataSource to the API
      });
      
      if (!priceUpdateResponse.ok) {
        throw new Error('Failed to update prices');
      }
      
      const priceUpdateResult = await priceUpdateResponse.json();
      console.log('Price update result:', priceUpdateResult);
      
      // Step 3: Timestamp already set to current time above

      // Step 4: Call revalidation API to clear cache
      console.log('Revalidating KPI data...');
      const revalidationResponse = await fetch('/api/revalidate-kpi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (revalidationResponse.ok) {
        // Wait for database operations to complete before refreshing UI
        console.log('Waiting for database operations to complete...');
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
        
        // Refresh KPI data using callback if available, otherwise reload page
        if (onKpiRefresh) {
          console.log('Refreshing KPI data...');
          await onKpiRefresh();
        } else {
          console.log('No KPI refresh callback, reloading page...');
          window.location.reload();
        }
      } else {
        throw new Error('Failed to revalidate dashboard');
      }
    } catch (error) {
      console.error('Error during refresh:', error);
      // Show user-friendly error message
      alert('Failed to refresh data. Please try again.');
    } finally {
      // Always reset the loading state, regardless of success or failure
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
    console.log('🔍 DEBUG - formatLastRefresh input:', timestamp, 'Type:', typeof timestamp);
    if (!timestamp || timestamp.trim() === '') {
      console.log('🔍 DEBUG - Returning "Unknown" - timestamp is empty or null');
      return 'Unknown';
    }
    
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

  // Debug logging
  console.log('UniversalNavbar - kpiData:', kpiData);
  console.log('UniversalNavbar - formattedKpiData:', formattedKpiData);
  console.log('UniversalNavbar - isPrivacyMode:', isPrivacyMode);
  console.log('UniversalNavbar - dataSource:', dataSource);

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
            <nav aria-label="Loading navigation" className="flex space-x-8">
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
        {/* Mobile Layout - Optimized */}
        <div className="md:hidden">
          {/* Mobile Header - Brand + Controls */}
          <div className="flex justify-between items-center py-3">
            {/* Brand */}
            <h1 
              className="font-bold cursor-pointer"
              onClick={() => router.push('/module-selection')}
              style={{ 
                color: '#00FF95',
                fontSize: '24px',
                lineHeight: '1.2',
                textShadow: '0 0 25px rgba(0, 255, 149, 0.6), 0 0 50px rgba(0, 255, 149, 0.4), 0 0 75px rgba(0, 255, 149, 0.2)',
                letterSpacing: '0.05em'
              }}
            >
              WAGMI
            </h1>
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Module Selector Button - Mobile */}
              <WagmiButton
                onClick={() => router.push('/module-selection')}
                variant="outline"
                theme="green"
                size="icon"
                icon={
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                  </svg>
                }
                title="Module Selector"
              />
              
              {/* Refresh Icon */}
              <WagmiButton
                onClick={handleRetryKPI}
                disabled={isRetrying}
                variant="outline"
                theme="green"
                size="icon"
                icon={<RefreshIcon className="w-3 h-3" />}
                loading={isRetrying}
                title="Refresh prices & data"
              />

              {/* Privacy Toggle */}
              <WagmiButton
                onClick={() => {
                  const newPrivacyMode = !isPrivacyMode;
                  setIsPrivacyMode(newPrivacyMode);
                  onPrivacyModeChange?.(newPrivacyMode);
                }}
                variant={isPrivacyMode ? "primary" : "outline"}
                theme="green"
                size="icon"
                icon={
                  isPrivacyMode ? (
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  )
                }
                title={isPrivacyMode ? 'Show Data' : 'Privacy Mode'}
              />

              {/* Exit Dev Mode Button */}
              <WagmiButton
                onClick={handleSignOut}
                variant="outline"
                theme="green"
                size="icon"
                icon={
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                }
                title="Exit Dev Mode"
              />
            </div>
          </div>
          
          {/* Mobile Timestamp */}
          <div className="flex justify-center pb-3">
            <p style={{ color: '#A0A0A0', fontSize: '11px' }}>
              Last updated: {lastUpdatedTimestamp ? formatTimestampForDisplay(lastUpdatedTimestamp) : 'Unknown'}
            </p>
          </div>
          
          {/* Mobile Row 3 - KPI Ribbon */}
          <div className="flex justify-center items-center py-3" style={{ borderTop: '1px solid #333' }}>
            {hasError ? (
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: '#FF6B6B' }}
                />
                <span style={{ color: '#FF6B6B', fontSize: '12px' }}>Error loading data</span>
              </div>
            ) : formattedKpiData ? (
              <div className="flex items-center space-x-4 text-center">
                {dataSource !== 'personal-portfolio' && (
                  <div className="text-center">
                    <div style={{ color: '#A0A0A0', fontSize: '10px' }}>Investors</div>
                    <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600' }}>
                      {formattedKpiData.activeInvestors}
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <div style={{ color: '#A0A0A0', fontSize: '10px' }}>AUM</div>
                  <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600' }}>
                    {formattedKpiData.totalAUM}
                  </div>
                </div>
                {dataSource !== 'personal-portfolio' && formattedKpiData.cumulativeReturn && (
                  <div className="text-center">
                    <div style={{ color: '#A0A0A0', fontSize: '10px' }}>Return</div>
                    <div 
                      style={{ 
                        color: formattedKpiData.cumulativeReturn.startsWith('+') ? '#00FF95' : '#FF6B6B', 
                        fontSize: '14px', 
                        fontWeight: '600' 
                      }}
                    >
                      {formattedKpiData.cumulativeReturn}
                    </div>
                  </div>
                )}
                {dataSource !== 'personal-portfolio' && formattedKpiData.monthOnMonth && (
                  <div className="text-center">
                    <div style={{ color: '#A0A0A0', fontSize: '10px' }}>MoM</div>
                    <div 
                      style={{ 
                        color: formattedKpiData.monthOnMonth.startsWith('+') ? '#00FF95' : '#FF6B6B', 
                        fontSize: '14px', 
                        fontWeight: '600' 
                      }}
                    >
                      {formattedKpiData.monthOnMonth}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#A0A0A0', fontSize: '12px' }}>Loading KPI data...</div>
            )}
          </div>
          
          {/* Mobile Row 4 - Navigation Tabs */}
          <div className="flex justify-center items-center py-3" style={{ borderTop: '1px solid #333' }}>
            <nav aria-label="Mobile navigation" className="flex space-x-4 sm:space-x-6 overflow-x-auto w-full justify-center">
              {[
                { id: 'portfolio', label: 'Portfolio' },
                { id: 'analytics', label: 'Performance' },
                ...(dataSource === 'personal-portfolio' ? [] : [
                  { id: 'investors', label: 'Investors' },
                  { id: 'ai-copilot', label: 'AI Copilot' }
                ])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="py-2 px-2 text-sm font-medium transition-all duration-200 relative"
                  style={{
                    color: activeTab === tab.id ? '#00FF95' : '#A0A0A0',
                    borderBottom: activeTab === tab.id ? '2px solid #00FF95' : '2px solid transparent',
                    textShadow: activeTab === tab.id ? '0 0 10px rgba(0, 255, 149, 0.5)' : 'none',
                    fontSize: '14px'
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
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Row 1 - Brand + Controls */}
          <div className="flex justify-between items-center h-18 py-4">
          {/* Left - WAGMI Logo */}
          <div className="flex items-center">
            <h1 
              className="font-bold cursor-pointer"
              onClick={() => router.push('/module-selection')}
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
              Last updated: {lastUpdatedTimestamp ? formatTimestampForDisplay(lastUpdatedTimestamp) : 'Unknown'}
            </p>
            
            {/* Module Selector Button - Desktop */}
            <WagmiButton
              onClick={() => router.push('/module-selection')}
              variant="outline"
              theme="green"
              size="icon"
              icon={
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              }
              title="Module Selector"
            />
            
            {/* Refresh Icon */}
            <WagmiButton
              onClick={handleRetryKPI}
              disabled={isRetrying}
              variant="outline"
              theme="green"
              size="icon"
              icon={<RefreshIcon className="w-3 h-3" />}
              loading={isRetrying}
              title="Refresh prices & data"
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
              size="icon"
              icon={
                isPrivacyMode ? (
                  // Eye with slash icon (privacy ON)
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  // Open eye icon (privacy OFF)
                  <svg fill="currentColor" viewBox="0 0 24 24">
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
              size="icon"
              icon={
                <svg fill="currentColor" viewBox="0 0 24 24">
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
          <nav aria-label="Desktop navigation" className="flex space-x-8">
            {[
              ...(dataSource === 'performance-dashboard' ? [
                { id: 'performance', label: 'Performance Dashboard' }
              ] : dataSource === 'personal-portfolio' ? [
                { id: 'portfolio', label: 'Portfolio Overview' },
                { id: 'analytics', label: 'Performance' }
              ] : [
                { id: 'portfolio', label: 'Portfolio Overview' },
                { id: 'analytics', label: 'Performance' },
                { id: 'investors', label: 'Investors' },
                { id: 'ai-copilot', label: 'AI Copilot' }
              ])
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

          {/* Right - KPI Ribbon (hidden for performance dashboard) */}
          {dataSource !== 'performance-dashboard' && (
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
                {/* Active Investors - Only for WAGMI Fund */}
                {dataSource !== 'personal-portfolio' && (
                  <WagmiCard variant="ribbon" theme="green" size="sm">
                    <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">
                      Active Investors
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {formattedKpiData?.activeInvestors || '--'}
                    </p>
                  </WagmiCard>
                )}

                {/* Total AUM - Always show */}
                <WagmiCard variant="ribbon" theme="green" size="sm">
                  <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">
                    Total AUM
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {formattedKpiData?.totalAUM || '--'}
                  </p>
                </WagmiCard>

                {/* Cumulative Return - Show for both WAGMI Fund and Personal Portfolio */}
                {formattedKpiData?.cumulativeReturn && (
                  <WagmiCard variant="ribbon" theme="green" size="sm">
                    <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">
                      Cumulative Return
                    </p>
                    <p 
                      className="text-sm font-semibold"
                      style={{ 
                        color: formattedKpiData?.cumulativeReturn?.startsWith('+') ? '#00FF95' : '#FF4D4D'
                      }}
                    >
                      {formattedKpiData?.cumulativeReturn || '--'}
                    </p>
                  </WagmiCard>
                )}

                {/* MoM Return - Show for both WAGMI Fund and Personal Portfolio */}
                {formattedKpiData?.monthOnMonth && (
                  <WagmiCard variant="ribbon" theme="green" size="sm">
                    <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">
                      MoM Return
                    </p>
                    <p 
                      className="text-sm font-semibold"
                      style={{ 
                        color: formattedKpiData?.monthOnMonth?.startsWith('+') ? '#00FF95' : '#FF4D4D'
                      }}
                    >
                      {formattedKpiData?.monthOnMonth || '--'}
                    </p>
                  </WagmiCard>
                )}
              </>
            )}
          </div>
          )}
        </div>
        
        </div>
      </div>
    </header>
  );
}
