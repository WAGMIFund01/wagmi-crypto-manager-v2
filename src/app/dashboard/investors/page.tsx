'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

// Mock data - replace with actual data fetching
const mockInvestors = [
  {
    id: 'LK1',
    name: 'Leke Karunwi',
    initialInvestmentDate: '10/07/2024',
    totalInvestment: 2000.00,
    currentValue: 3145.25,
    shareOfAUM: 14.6,
    return: 57.0
  },
  {
    id: 'MO2',
    name: 'Mariam Oyawoye',
    initialInvestmentDate: '10/09/2024',
    totalInvestment: 1050.06,
    currentValue: 1648.23,
    shareOfAUM: 7.6,
    return: 57.0
  },
  {
    id: 'FO3',
    name: 'Fifehanmi Oyawoye',
    initialInvestmentDate: '10/13/2024',
    totalInvestment: 1823.91,
    currentValue: 2415.10,
    shareOfAUM: 11.2,
    return: 32.0
  },
  {
    id: 'RA4',
    name: 'Rinsola Aminu',
    initialInvestmentDate: '11/18/2024',
    totalInvestment: 828.30,
    currentValue: 1276.68,
    shareOfAUM: 5.9,
    return: 54.0
  },
  {
    id: 'OK5',
    name: 'Oyinkan Karunwi',
    initialInvestmentDate: '11/18/2024',
    totalInvestment: 991.57,
    currentValue: 1073.62,
    shareOfAUM: 5.0,
    return: 8.0
  },
  {
    id: 'OA6',
    name: 'Omair Ansari',
    initialInvestmentDate: '11/25/2024',
    totalInvestment: 11212.46,
    currentValue: 12045.27,
    shareOfAUM: 55.8,
    return: 7.0
  }
];

type FilterType = 'returns' | 'size' | 'aum';
type FilterValue = string;

interface Investor {
  id: string;
  name: string;
  initialInvestmentDate: string;
  totalInvestment: number;
  currentValue: number;
  shareOfAUM: number;
  return: number;
}

export default function InvestorsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<FilterType, FilterValue[]>>({
    returns: [],
    size: [],
    aum: []
  });
  const [sortColumn, setSortColumn] = useState<keyof Investor | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  
  // Navbar state
  const [isDevMode, setIsDevMode] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [kpiData, setKpiData] = useState<any>(null);
  const [hasError, setHasError] = useState(false);

  // Check for dev mode session on mount
  useEffect(() => {
    const devSession = sessionStorage.getItem('devSession');
    if (devSession) {
      setIsDevMode(true);
    }
  }, []);

  // Fetch KPI data
  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        const response = await fetch('/api/get-kpi-data');
        if (response.ok) {
          const data = await response.json();
          setKpiData(data);
          setHasError(false);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        setHasError(true);
      }
    };

    fetchKPIData();
  }, []);

  const handleSignOut = () => {
    if (isDevMode) {
      sessionStorage.removeItem('devSession');
      setIsDevMode(false);
    }
    router.push('/');
  };

  const handleRetryKPI = async () => {
    setIsRetrying(true);
    try {
      const response = await fetch('/api/revalidate-kpi', { method: 'POST' });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error refreshing KPI data:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const formatLastRefresh = (timestamp: string) => {
    if (!timestamp || timestamp.trim() === '') return 'Unknown';
    
    try {
      // Handle Excel serial date format
      if (timestamp.includes('.')) {
        const serialDate = parseFloat(timestamp);
        const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
        const date = new Date(excelEpoch.getTime() + serialDate * 24 * 60 * 60 * 1000);
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      
      // Handle regular date format
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown';
    }
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === 'analytics') {
      router.push('/dashboard/analytics');
    } else if (tabId === 'portfolio') {
      router.push('/dashboard');
    }
    // Stay on investors page for 'investors' tab
  };

  // Filter and search logic
  const filteredInvestors = useMemo(() => {
    let filtered = mockInvestors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(investor =>
        investor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Returns filter
    if (filters.returns.length > 0) {
      filtered = filtered.filter(investor => {
        if (filters.returns.includes('Positive') && investor.return > 0) return true;
        if (filters.returns.includes('Negative') && investor.return < 0) return true;
        if (filters.returns.includes('High (50%+)') && investor.return >= 50) return true;
        return false;
      });
    }

    // Size filter
    if (filters.size.length > 0) {
      filtered = filtered.filter(investor => {
        if (filters.size.includes('Small (<$1K)') && investor.totalInvestment < 1000) return true;
        if (filters.size.includes('Medium ($1K-$5K)') && investor.totalInvestment >= 1000 && investor.totalInvestment <= 5000) return true;
        if (filters.size.includes('Large (>$5K)') && investor.totalInvestment > 5000) return true;
        return false;
      });
    }

    // AUM% filter
    if (filters.aum.length > 0) {
      filtered = filtered.filter(investor => {
        if (filters.aum.includes('Minor (<5%)') && investor.shareOfAUM < 5) return true;
        if (filters.aum.includes('Moderate (5-20%)') && investor.shareOfAUM >= 5 && investor.shareOfAUM <= 20) return true;
        if (filters.aum.includes('Major (>20%)') && investor.shareOfAUM > 20) return true;
        return false;
      });
    }

    return filtered;
  }, [searchTerm, filters]);

  // Sort logic
  const sortedInvestors = useMemo(() => {
    if (!sortColumn) return filteredInvestors;

    return [...filteredInvestors].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }, [filteredInvestors, sortColumn, sortDirection]);

  const handleSort = (column: keyof Investor) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterToggle = (type: FilterType, value: FilterValue) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      returns: [],
      size: [],
      aum: []
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Format KPI data with privacy mode
  const formattedKpiData = kpiData ? {
    activeInvestors: isPrivacyMode ? '•••' : kpiData.totalInvestors.toString(),
    totalAUM: isPrivacyMode ? '••••••' : `$${kpiData.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cumulativeReturn: isPrivacyMode ? '•••' : `+${kpiData.cumulativeReturn.toFixed(1)}%`,
    monthOnMonth: isPrivacyMode ? '•••' : `${kpiData.monthlyReturn >= 0 ? '+' : ''}${kpiData.monthlyReturn.toFixed(1)}%`
  } : null;

  return (
    <div style={{ backgroundColor: '#0B0B0B' }}>
      {/* Navigation Header - Two-Row Navbar */}
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
              <p className="mr-8" style={{ color: '#A0A0A0', fontSize: '12px' }}>
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
                  onClick={() => handleTabClick(tab.id)}
                  className="py-2 px-1 text-sm font-medium transition-all duration-200 relative"
                  style={{
                    color: tab.id === 'investors' ? '#00FF95' : '#A0A0A0',
                    borderBottom: tab.id === 'investors' ? '2px solid #00FF95' : '2px solid transparent',
                    textShadow: tab.id === 'investors' ? '0 0 10px rgba(0, 255, 149, 0.5)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (tab.id !== 'investors') {
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.textShadow = '0 0 5px rgba(0, 255, 149, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tab.id !== 'investors') {
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

      {/* Filters Row */}
      <div className="px-6 mb-6">
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: '#1A1F1A' }}>
          {/* Search Box */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border transition-all duration-200"
              style={{
                backgroundColor: '#2A2A2A',
                borderColor: '#404040',
                color: '#FFFFFF',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00FF95';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 255, 149, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#404040';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap gap-6">
            {/* Returns Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: '#A0A0A0' }}>
                RETURNS
              </label>
              <div className="flex gap-2">
                {['Positive', 'Negative', 'High (50%+)'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterToggle('returns', filter)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.returns.includes(filter)
                        ? 'text-white'
                        : 'text-gray-400 border border-gray-400'
                    }`}
                    style={{
                      backgroundColor: filters.returns.includes(filter) ? '#00FF95' : 'transparent',
                      borderColor: filters.returns.includes(filter) ? '#00FF95' : '#666666'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: '#A0A0A0' }}>
                SIZE
              </label>
              <div className="flex gap-2">
                {['Small (<$1K)', 'Medium ($1K-$5K)', 'Large (>$5K)'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterToggle('size', filter)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.size.includes(filter)
                        ? 'text-white'
                        : 'text-gray-400 border border-gray-400'
                    }`}
                    style={{
                      backgroundColor: filters.size.includes(filter) ? '#00FF95' : 'transparent',
                      borderColor: filters.size.includes(filter) ? '#00FF95' : '#666666'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* AUM% Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: '#A0A0A0' }}>
                AUM %
              </label>
              <div className="flex gap-2">
                {['Minor (<5%)', 'Moderate (5-20%)', 'Major (>20%)'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterToggle('aum', filter)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.aum.includes(filter)
                        ? 'text-white'
                        : 'text-gray-400 border border-gray-400'
                    }`}
                    style={{
                      backgroundColor: filters.aum.includes(filter) ? '#00FF95' : 'transparent',
                      borderColor: filters.aum.includes(filter) ? '#00FF95' : '#666666'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clear All Button */}
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#666666',
              color: '#A0A0A0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00FF95';
              e.currentTarget.style.color = '#00FF95';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#666666';
              e.currentTarget.style.color = '#A0A0A0';
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Investor Table */}
      <div className="px-6">
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#1A1F1A' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#2A2A2A' }}>
                  {[
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'NAME' },
                    { key: 'initialInvestmentDate', label: 'INITIAL INVESTMENT DATE' },
                    { key: 'totalInvestment', label: 'TOTAL INVESTMENT ($)' },
                    { key: 'currentValue', label: 'CURRENT VALUE ($)' },
                    { key: 'shareOfAUM', label: 'SHARE OF AUM (%)' },
                    { key: 'return', label: 'RETURN (%)' },
                    { key: 'actions', label: '' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      style={{ color: '#A0A0A0' }}
                      onClick={() => key !== 'actions' && handleSort(key as keyof Investor)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key !== 'actions' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedInvestors.map((investor, index) => (
                  <tr
                    key={investor.id}
                    className="transition-all duration-200 hover:bg-opacity-10"
                    style={{
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                      borderBottom: '1px solid #333'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.05)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 149, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#FFFFFF' }}>
                      {investor.id}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                      {investor.name}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#A0A0A0' }}>
                      {investor.initialInvestmentDate}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                      {formatCurrency(investor.totalInvestment)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                      {formatCurrency(investor.currentValue)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#A0A0A0' }}>
                      {investor.shareOfAUM.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: investor.return >= 0 ? '#00FF95' : '#FF4D4D' }}>
                      {formatPercentage(investor.return)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedInvestor(investor)}
                        className="px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: '#666666',
                          color: '#A0A0A0'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#00FF95';
                          e.currentTarget.style.color = '#00FF95';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#666666';
                          e.currentTarget.style.color = '#A0A0A0';
                        }}
                      >
                        More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Investor Detail Modal */}
      {selectedInvestor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#00FF95' }}>
                  {selectedInvestor.name}
                </h2>
                <button
                  onClick={() => setSelectedInvestor(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                    Investment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Investor ID:</span>
                      <span style={{ color: '#FFFFFF' }}>{selectedInvestor.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Initial Investment:</span>
                      <span style={{ color: '#FFFFFF' }}>{formatCurrency(selectedInvestor.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Current Value:</span>
                      <span style={{ color: '#FFFFFF' }}>{formatCurrency(selectedInvestor.currentValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Return:</span>
                      <span style={{ color: selectedInvestor.return >= 0 ? '#00FF95' : '#FF4D4D' }}>
                        {formatPercentage(selectedInvestor.return)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                    Portfolio Share
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Share of AUM:</span>
                      <span style={{ color: '#FFFFFF' }}>{selectedInvestor.shareOfAUM.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Investment Date:</span>
                      <span style={{ color: '#FFFFFF' }}>{selectedInvestor.initialInvestmentDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
