import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardClient from '@/app/wagmi-fund-module/DashboardClient';

// Enable ISR with 60-second revalidation (consistent with other modules)
export const revalidate = 60;

export default async function PerformanceDashboardPage() {
  // Get session on the server (consistent with other modules)
  const session = await getServerSession(authOptions);
  
  // Always render the client component - let it handle authentication
  // This allows dev mode sessions to work properly
  return (
    <DashboardClient 
      session={session}
      kpiData={null} // No KPI data needed for performance dashboard
      hasError={false}
      dataSource="performance-dashboard"
    />
  );
}
