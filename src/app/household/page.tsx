'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardClient from '@/app/wagmi-fund-module/DashboardClient';

export default function HouseholdPage() {
  const router = useRouter();
  const [kpiData, setKpiData] = useState<{
    activeInvestors?: string;
    totalAUM: string;
    cumulativeReturn?: string;
    monthOnMonth?: string;
    lastUpdated: string;
  } | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for household session
    const householdSessionData = sessionStorage.getItem('householdSession');
    const isHouseholdMode = sessionStorage.getItem('isHouseholdMode');
    
    if (!householdSessionData || isHouseholdMode !== 'true') {
      router.push('/login');
      return;
    }

    const fetchKpiData = async () => {
      try {
        const response = await fetch('/api/get-personal-portfolio-kpi');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.totalAUM) {
            setKpiData({
              activeInvestors: undefined, // Will be hidden by UniversalNavbar
              totalAUM: `$${data.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              cumulativeReturn: `${data.cumulativeReturn >= 0 ? '+' : ''}${data.cumulativeReturn.toFixed(1)}%`,
              monthOnMonth: `${data.monthlyReturn >= 0 ? '+' : ''}${data.monthlyReturn.toFixed(1)}%`,
              lastUpdated: data.lastUpdated
            });
          } else {
            setHasError(true);
          }
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('Error fetching household KPI data:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpiData();
  }, [router]);

  // Create a mock session for DashboardClient
  const mockSession = {
    user: {
      email: 'household@wagmi.com',
      name: 'Household User',
      role: 'manager' as const
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading household dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl">Error loading household dashboard</div>
          <p className="mt-4 text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient 
      session={mockSession} 
      kpiData={kpiData} 
      hasError={hasError}
      dataSource="household"
      isHouseholdLogin={true}
    />
  );
}