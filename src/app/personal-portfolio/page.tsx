import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchPersonalPortfolioKPIData } from '@/lib/personal-portfolio-kpi-data';
import DashboardClient from '@/app/wagmi-fund-module/DashboardClient';

// Enable ISR with 60-second revalidation (consistent with WAGMI Fund module)
export const revalidate = 60;

export default async function PersonalPortfolioPage() {
  // Get session on the server (consistent with WAGMI Fund module)
  const session = await getServerSession(authOptions);
  
  // Fetch Personal Portfolio KPI data on the server
  const kpiData = await fetchPersonalPortfolioKPIData();
  const hasError = !kpiData;
  
  // Transform data for display only if we have valid data
  const transformedKpiData = kpiData ? {
    activeInvestors: undefined, // Will be hidden by UniversalNavbar
    totalAUM: `$${kpiData.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cumulativeReturn: undefined, // Will be hidden by UniversalNavbar
    monthOnMonth: undefined, // Will be hidden by UniversalNavbar
    lastUpdated: kpiData.lastUpdated
  } : null;

  // Always render the client component - let it handle authentication
  // This allows dev mode sessions to work properly
  return (
    <DashboardClient 
      session={session}
      kpiData={transformedKpiData}
      hasError={hasError}
      dataSource="personal-portfolio"
    />
  );
}
