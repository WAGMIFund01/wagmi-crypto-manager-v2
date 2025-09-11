'use client';

import { useState, useEffect } from 'react';
import TransactionModal from '@/components/TransactionModal';

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

interface InvestorsProps {
  isPrivacyMode?: boolean;
}

export default function Investors({ isPrivacyMode = false }: InvestorsProps) {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch investor data on component mount
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const response = await fetch('/api/get-investor-data');
        const data = await response.json();
        
        if (data.success && data.investors) {
          setInvestors(data.investors);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch investor data');
        }
      } catch (err) {
        console.error('Error fetching investors:', err);
        setError('Network error while fetching investor data');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestors();
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

  // Create masking dots for privacy mode
  const createMask = () => {
    return '•••••';
  };

  // Handle row click to open transaction modal
  const handleRowClick = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedInvestor(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div style={{ color: '#00FF95', fontSize: '18px' }}>Loading investors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div style={{ color: '#FF4D4D', fontSize: '18px' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Investor Table */}
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
                  onClick={() => handleRowClick(investor)}
                  className="cursor-pointer transition-all duration-200 hover:bg-opacity-10"
                  style={{
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid #333'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    {investor.id}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                    {isPrivacyMode ? createMask() : investor.name}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#A0A0A0' }}>
                    {formatDate(investor.joinDate)}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                    {isPrivacyMode ? createMask() : formatCurrency(investor.investmentValue)}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                    {isPrivacyMode ? createMask() : formatCurrency(investor.currentValue)}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#A0A0A0' }}>
                    {isPrivacyMode ? createMask() : `${(investor.sharePercentage * 100).toFixed(1)}%`}
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

      {/* Transaction Modal */}
      {selectedInvestor && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          investorId={selectedInvestor.id}
          investorName={selectedInvestor.name}
        />
      )}
    </div>
  );
}
