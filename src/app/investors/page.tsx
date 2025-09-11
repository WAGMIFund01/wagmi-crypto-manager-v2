'use client';

import { useState, useEffect } from 'react';
import StandardNavbar from '@/components/StandardNavbar';

interface Investor {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  investmentValue: number;
  currentValue: number;
  sharePercentage: number;
  returnPercentage: number;
}

interface KPIData {
  activeInvestors: string;
  totalAUM: string;
  cumulativeReturn: string;
  monthOnMonth: string;
  lastUpdated: string;
}

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [kpiError, setKpiError] = useState(false);

  // Fetch both investor and KPI data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch investor data
        const investorResponse = await fetch('/api/get-investor-data');
        const investorData = await investorResponse.json();
        
        if (investorData.success && investorData.investors) {
          setInvestors(investorData.investors);
          setError(null);
        } else {
          setError(investorData.error || 'Failed to fetch investor data');
        }

        // Fetch KPI data
        const kpiResponse = await fetch('/api/get-kpi-data');
        const kpiResult = await kpiResponse.json();
        
        if (kpiResult.success && kpiResult.kpiData) {
          setKpiData(kpiResult.kpiData);
          setKpiError(false);
        } else {
          setKpiError(true);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Network error while fetching data');
        setKpiError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format percentage values
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Format date (handle Google Sheets Date format)
  const formatDate = (dateStr: string) => {
    try {
      // Handle Google Sheets Date format: Date(2024,9,10)
      if (dateStr.startsWith('Date(')) {
        const match = dateStr.match(/Date\((\d+),(\d+),(\d+)\)/);
        if (match) {
          const year = parseInt(match[1]);
          const month = parseInt(match[2]) + 1; // Google Sheets months are 0-indexed
          const day = parseInt(match[3]);
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          });
        }
      }
      return dateStr;
    } catch (err) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0B0B0B', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#00FF95', fontSize: '18px' }}>Loading investors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#0B0B0B', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#FF4D4D', fontSize: '18px' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0B0B0B', minHeight: '100vh' }}>
      {/* Standardized Navbar */}
      <StandardNavbar 
        activeTab="investors" 
        kpiData={kpiData} 
        hasError={kpiError} 
      />

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <h2 
            className="text-2xl font-bold"
            style={{ 
              color: '#00FF95',
              textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
            }}
          >
            Investor Management
          </h2>
          <p style={{ color: '#A0A0A0' }}>
            {investors.length} investors found
          </p>
        </div>

        {/* Investor Table */}
        <div className="mt-8">
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#1A1F1A' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#2A2A2A' }}>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                      Join Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                      Investment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                      Current Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                      Share %
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                      Return %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {investors.map((investor, index) => (
                    <tr
                      key={investor.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                        borderBottom: '1px solid #333'
                      }}
                    >
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#FFFFFF' }}>
                        {investor.id}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                        {investor.name}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#A0A0A0' }}>
                        {investor.email}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#A0A0A0' }}>
                        {formatDate(investor.joinDate)}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                        {formatCurrency(investor.investmentValue)}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                        {formatCurrency(investor.currentValue)}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#A0A0A0' }}>
                        {(investor.sharePercentage * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: investor.returnPercentage >= 0 ? '#00FF95' : '#FF4D4D' }}>
                        {formatPercentage(investor.returnPercentage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
