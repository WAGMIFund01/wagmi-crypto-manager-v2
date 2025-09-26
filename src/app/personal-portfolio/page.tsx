import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardClient from '@/app/wagmi-fund-module/DashboardClient';

export default async function PersonalPortfolioPage() {
  // Get session on the server (consistent with WAGMI Fund module)
  const session = await getServerSession(authOptions);
  
  // Step 2: Identical UI - Use same data source as WAGMI Fund for now
  // This ensures we have a clean baseline before implementing conditional rendering
  // Let DashboardClient handle authentication (consistent with WAGMI Fund module)
  return (
    <DashboardClient 
      session={session}
      kpiData={null}
      hasError={false}
    />
  );
}
