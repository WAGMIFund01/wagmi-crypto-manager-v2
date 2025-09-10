import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchKPIData, fallbackKPIData } from '@/lib/kpi-data';
import DashboardClient from './DashboardClient';

// Enable ISR with 60-second revalidation
export const revalidate = 60;

export default async function DashboardPage() {
  // Get session on the server
  const session = await getServerSession(authOptions);
  
  // Fetch KPI data on the server
  const kpiData = await fetchKPIData();
  const finalKpiData = kpiData || fallbackKPIData;
  
  // Transform data for display
  const transformedKpiData = {
    activeInvestors: finalKpiData.totalInvestors.toString(),
    totalAUM: `$${finalKpiData.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cumulativeReturn: `+${finalKpiData.cumulativeReturn.toFixed(1)}%`,
    monthOnMonth: `${finalKpiData.monthlyReturn >= 0 ? '+' : ''}${finalKpiData.monthlyReturn.toFixed(1)}%`
  };

  // Check if user has access
  if (!session || session.user?.role !== 'manager') {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0B0B0B' }}>
        <div className="text-center">
          <p style={{ color: '#E0E0E0' }}>Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient 
      session={session}
      kpiData={transformedKpiData}
      hasError={!kpiData}
    />
  );
}
