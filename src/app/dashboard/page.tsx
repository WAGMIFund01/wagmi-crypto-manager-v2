'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
// Removed unused imports - using custom styled components instead

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
    <div style={{ backgroundColor: '#0B0B0B' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#0B0B0B', borderColor: '#333' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center" style={{ paddingLeft: '32px' }}>
              {/* WAGMI Logo */}
              <div className="flex items-center">
                <h1 
                  className="font-bold"
                  style={{ 
                    color: '#00FF95',
                    fontSize: '32px',
                    lineHeight: '1.2',
                    textShadow: '0 0 25px rgba(0, 255, 149, 0.6), 0 0 50px rgba(0, 255, 149, 0.4), 0 0 75px rgba(0, 255, 149, 0.2)',
                    letterSpacing: '0.05em'
                  }}
                >
                  WAGMI
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Manager Info */}
              <div className="text-right mr-4">
                <h2 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                  Manager Dashboard
                </h2>
                <p style={{ color: '#E0E0E0', fontSize: '14px', margin: 0 }}>
                  {session.user?.email}
                </p>
              </div>
              
              <button
                onClick={() => signOut()}
                className="font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #00FF95',
                  color: '#00FF95',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.1)';
                  e.currentTarget.style.boxShadow = '0px 0px 10px rgba(0, 255, 149, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Portfolio Overview */}
          <div 
            className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)]"
            style={{ 
              backgroundColor: '#1A1F1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-4">
              <h3 
                className="text-lg font-semibold"
                style={{ 
                  color: '#00FF95',
                  textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
                }}
              >
                Portfolio Overview
              </h3>
              <p style={{ color: '#E0E0E0', fontSize: '14px', lineHeight: '1.5' }}>
                View and manage all investor portfolios with real-time performance metrics
              </p>
              <button
                className="w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: '#00FF95',
                  color: '#1A1A1A',
                  border: 'none',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00B863';
                  e.currentTarget.style.boxShadow = '0px 0px 15px rgba(0, 255, 149, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00FF95';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                View Portfolios
              </button>
            </div>
          </div>

          {/* Investor Management */}
          <div 
            className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)]"
            style={{ 
              backgroundColor: '#1A1F1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-4">
              <h3 
                className="text-lg font-semibold"
                style={{ 
                  color: '#00FF95',
                  textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
                }}
              >
                Investor Management
              </h3>
              <p style={{ color: '#E0E0E0', fontSize: '14px', lineHeight: '1.5' }}>
                Add new investors, manage access permissions, and update investor data
              </p>
              <button
                className="w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: '#00FF95',
                  color: '#1A1A1A',
                  border: 'none',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00B863';
                  e.currentTarget.style.boxShadow = '0px 0px 15px rgba(0, 255, 149, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00FF95';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Manage Investors
              </button>
            </div>
          </div>

          {/* Analytics & Reports */}
          <div 
            className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)]"
            style={{ 
              backgroundColor: '#1A1F1A',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
            }}
          >
            <div className="space-y-4">
              <h3 
                className="text-lg font-semibold"
                style={{ 
                  color: '#00FF95',
                  textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
                }}
              >
                Analytics & Reports
              </h3>
              <p style={{ color: '#E0E0E0', fontSize: '14px', lineHeight: '1.5' }}>
                Generate comprehensive performance reports and analytics dashboards
              </p>
              <button
                className="w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: '#00FF95',
                  color: '#1A1A1A',
                  border: 'none',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00B863';
                  e.currentTarget.style.boxShadow = '0px 0px 15px rgba(0, 255, 149, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00FF95';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                View Reports
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
