'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import StandardNavbar from '@/components/StandardNavbar';

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

  // Handle tab navigation
  const handleTabClick = (tabId: string) => {
    if (tabId === 'investors') {
      router.push('/investors');
    } else if (tabId === 'analytics') {
      router.push('/analytics');
    } else {
      setActiveTab('portfolio');
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
      {/* Standardized Navbar */}
      <StandardNavbar 
        activeTab="portfolio" 
        kpiData={kpiData} 
        hasError={hasError} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  );
}
