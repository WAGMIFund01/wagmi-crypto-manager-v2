import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchKPIData } from '@/lib/kpi-data';
import DashboardClient from './DashboardClient';

// Enable ISR with 60-second revalidation
export const revalidate = 60;

export default async function DashboardPage() {
  // Get session on the server
  const session = await getServerSession(authOptions);
  
  // Fetch KPI data on the server
  const kpiData = await fetchKPIData();
  const hasError = !kpiData;
  
  // Transform data for display only if we have valid data
  const transformedKpiData = kpiData ? {
    activeInvestors: kpiData.totalInvestors.toString(),
    totalAUM: `$${kpiData.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cumulativeReturn: `${kpiData.cumulativeReturn >= 0 ? '+' : ''}${kpiData.cumulativeReturn.toFixed(1)}%`,
    monthOnMonth: `${kpiData.monthlyReturn >= 0 ? '+' : ''}${kpiData.monthlyReturn.toFixed(1)}%`,
    lastUpdated: kpiData.lastUpdated
  } : null;

  // Always render the client component - let it handle authentication
  // This allows dev mode sessions to work properly
  return (
    <DashboardClient 
      session={session}
      kpiData={transformedKpiData}
      hasError={hasError}
    />
  );
}
