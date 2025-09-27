import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PerformanceDashboard from '@/components/PerformanceDashboard';

export default async function PerformancePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Performance Monitor</h1>
          <p className="text-gray-400">
            Real-time performance metrics and system health monitoring
          </p>
        </div>
        
        <PerformanceDashboard />
      </div>
    </div>
  );
}

