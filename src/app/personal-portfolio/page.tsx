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
    
    console.log('Personal Portfolio KPI fetch response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Personal Portfolio KPI data received:', data);
      
      if (data.success) {
        kpiData = {
          // Personal Portfolio only shows AUM, other fields are undefined for conditional rendering
          activeInvestors: undefined, // Will be hidden by UniversalNavbar
          totalAUM: `$${data.data.totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          cumulativeReturn: undefined, // Will be hidden by UniversalNavbar
          monthOnMonth: undefined, // Will be hidden by UniversalNavbar
          lastUpdated: data.data.lastUpdated
        };
        console.log('Personal Portfolio KPI data formatted:', kpiData);
      } else {
        console.error('Personal Portfolio KPI API returned success: false');
        hasError = true;
      }
    } else {
      console.error('Personal Portfolio KPI API response not ok:', response.status);
      hasError = true;
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
