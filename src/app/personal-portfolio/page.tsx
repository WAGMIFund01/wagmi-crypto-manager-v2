import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchKPIData } from '@/lib/kpi-data';
import DashboardClient from '@/app/wagmi-fund-module/DashboardClient';

// Enable ISR with 60-second revalidation (consistent with WAGMI Fund module)
export const revalidate = 60;

export default async function PersonalPortfolioPage() {
  // Get session on the server (consistent with WAGMI Fund module)
  const session = await getServerSession(authOptions);
  
  // Fetch KPI data on the server (consistent with WAGMI Fund module)
  const kpiData = await fetchKPIData();
  const hasError = !kpiData;
  
  // Transform data for display only if we have valid data (consistent with WAGMI Fund module)
  const transformedKpiData = kpiData ? {
    activeInvestors: kpiData.totalInvestors.toString(),
    totalAUM: `$${kpiData.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cumulativeReturn: `${kpiData.cumulativeReturn >= 0 ? '+' : ''}${kpiData.cumulativeReturn.toFixed(1)}%`,
    monthOnMonth: `${kpiData.monthlyReturn >= 0 ? '+' : ''}${kpiData.monthlyReturn.toFixed(1)}%`,
    lastUpdated: kpiData.lastUpdated
  } : null;
  
  // Step 2: Identical UI - Use same data source as WAGMI Fund for now
  // This ensures we have a clean baseline before implementing conditional rendering
  // Let DashboardClient handle authentication (consistent with WAGMI Fund module)
  return (
    <DashboardClient 
      session={session}
      kpiData={transformedKpiData}
      hasError={hasError}
    />
  );
}
