import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardClient from '@/app/wagmi-fund-module/DashboardClient';

// Enable ISR with 60-second revalidation (consistent with WAGMI Fund module)
export const revalidate = 60;

export default async function PersonalPortfolioPage() {
  // Get session on the server (consistent with WAGMI Fund module)
  const session = await getServerSession(authOptions);
  
  // Fetch Personal Portfolio KPI data on the server-side
  let kpiData = null;
  let hasError = false;
  
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/get-personal-portfolio-kpi`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        kpiData = {
          totalAUM: `$${data.data.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          lastUpdated: data.data.lastUpdated
        };
      }
    }
  } catch (error) {
    console.error('Error fetching personal portfolio KPI data:', error);
    hasError = true;
  }
  
  return (
    <DashboardClient 
      session={session}
      kpiData={kpiData}
      hasError={hasError}
      dataSource="personal-portfolio"
    />
  );
}
