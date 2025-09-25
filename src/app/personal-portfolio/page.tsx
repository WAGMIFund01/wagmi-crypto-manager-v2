import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardClient from '../wagmi-fund-module/DashboardClient';

// Enable ISR with 60-second revalidation
export const revalidate = 60;

export default async function PersonalPortfolioPage() {
  // Get session on the server
  const session = await getServerSession(authOptions);
  
  // For personal portfolio, we don't need KPI data like the fund
  // We'll just pass null and let the components handle it
  
  // Always render the client component - let it handle authentication
  return (
    <DashboardClient 
      session={session}
      kpiData={null}
      hasError={false}
    />
  );
}
