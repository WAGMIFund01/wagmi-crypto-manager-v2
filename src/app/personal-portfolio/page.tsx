import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function PersonalPortfolioPage() {
  // Check authentication - this prevents direct URL access without login
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Step 2: Identical UI - Use same data source as WAGMI Fund for now
  // This ensures we have a clean baseline before implementing conditional rendering
  redirect('/wagmi-fund-module');
}
