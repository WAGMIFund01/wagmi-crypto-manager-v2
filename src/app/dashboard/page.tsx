'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/shared/components';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }
    
    if (session.user?.role === 'unauthorized') {
      // Redirect unauthorized users back to homepage
      router.push('/');
      return;
    }
    
    if (session.user?.role !== 'manager') {
      // Redirect non-manager users to investor page or homepage
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'manager') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Manager Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Welcome, {session.user?.email}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                View and manage all investor portfolios
              </p>
              <Button className="mt-4 w-full">
                View Portfolios
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Add new investors and manage access
              </p>
              <Button className="mt-4 w-full">
                Manage Investors
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Generate performance reports
              </p>
              <Button className="mt-4 w-full">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
