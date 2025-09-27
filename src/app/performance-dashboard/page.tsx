import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PerformanceDashboardClient from './PerformanceDashboardClient';

export default async function PerformanceDashboardPage() {
  // Get session on the server (but don't redirect - let client handle auth)
  const session = await getServerSession(authOptions);
  
  // Always render the client component - let it handle authentication
  // This allows dev mode sessions to work properly
  return (
    <PerformanceDashboardClient session={session} />
  );
}
