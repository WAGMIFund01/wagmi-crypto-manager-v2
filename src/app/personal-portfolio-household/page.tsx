'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardClient from '@/app/wagmi-fund-module/DashboardClient';

export default function PersonalPortfolioHouseholdPage() {
  const router = useRouter();
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in as household
    const isHouseholdLoggedIn = sessionStorage.getItem('isHouseholdMode');
    if (!isHouseholdLoggedIn) {
      router.push('/');
      return;
    }

    fetchKpiData();
  }, [router]);

  const fetchKpiData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching Personal Portfolio KPI data for household...');
      const response = await fetch('/api/get-personal-portfolio-kpi-data');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Personal Portfolio KPI data fetched successfully:', data.data);
        setKpiData(data.data);
      } else {
        setError('Failed to fetch KPI data');
      }
    } catch (error) {
      console.error('❌ Error fetching KPI data:', error);
      setError('Failed to fetch KPI data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-white mt-4">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Transform KPI data for the navbar
  const transformedKpiData = kpiData ? {
    activeInvestors: undefined, // Will be hidden by UniversalNavbar
    totalAUM: `$${kpiData.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cumulativeReturn: `${kpiData.cumulativeReturn >= 0 ? '+' : ''}${kpiData.cumulativeReturn.toFixed(1)}%`,
    monthOnMonth: `${kpiData.monthlyReturn >= 0 ? '+' : ''}${kpiData.monthlyReturn.toFixed(1)}%`,
    lastUpdated: kpiData.lastUpdated
  } : null;

  // Create a mock session for the DashboardClient
  const mockSession = {
    user: {
      email: 'household@wagmi.com',
      name: 'Household User',
      role: 'household'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  return (
    <DashboardClient 
      session={mockSession}
      kpiData={transformedKpiData}
      hasError={!kpiData}
      dataSource="personal-portfolio"
    />
  );
}
