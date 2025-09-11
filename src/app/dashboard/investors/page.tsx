'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Mock data - replace with actual data fetching
const mockInvestors = [
  {
    id: 'LK1',
    name: 'Leke Karunwi',
    initialInvestmentDate: '10/07/2024',
    totalInvestment: 2000.00,
    currentValue: 3145.25,
    shareOfAUM: 14.6,
    return: 57.0
  },
  {
    id: 'MO2',
    name: 'Mariam Oyawoye',
    initialInvestmentDate: '10/09/2024',
    totalInvestment: 1050.06,
    currentValue: 1648.23,
    shareOfAUM: 7.6,
    return: 57.0
  },
  {
    id: 'FO3',
    name: 'Fifehanmi Oyawoye',
    initialInvestmentDate: '10/13/2024',
    totalInvestment: 1823.91,
    currentValue: 2415.10,
    shareOfAUM: 11.2,
    return: 32.0
  },
  {
    id: 'RA4',
    name: 'Rinsola Aminu',
    initialInvestmentDate: '11/18/2024',
    totalInvestment: 828.30,
    currentValue: 1276.68,
    shareOfAUM: 5.9,
    return: 54.0
  },
  {
    id: 'OK5',
    name: 'Oyinkan Karunwi',
    initialInvestmentDate: '11/18/2024',
    totalInvestment: 991.57,
    currentValue: 1073.62,
    shareOfAUM: 5.0,
    return: 8.0
  },
  {
    id: 'OA6',
    name: 'Omair Ansari',
    initialInvestmentDate: '11/25/2024',
    totalInvestment: 11212.46,
    currentValue: 12045.27,
    shareOfAUM: 55.8,
    return: 7.0
  }
];

type FilterType = 'returns' | 'size' | 'aum';
type FilterValue = string;

interface Investor {
  id: string;
  name: string;
  initialInvestmentDate: string;
  totalInvestment: number;
  currentValue: number;
  shareOfAUM: number;
  return: number;
}

export default function InvestorsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<FilterType, FilterValue[]>>({
    returns: [],
    size: [],
    aum: []
  });
  const [sortColumn, setSortColumn] = useState<keyof Investor | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);

  // Filter and search logic
  const filteredInvestors = useMemo(() => {
    let filtered = mockInvestors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(investor =>
        investor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Returns filter
    if (filters.returns.length > 0) {
      filtered = filtered.filter(investor => {
        if (filters.returns.includes('Positive') && investor.return > 0) return true;
        if (filters.returns.includes('Negative') && investor.return < 0) return true;
        if (filters.returns.includes('High (50%+)') && investor.return >= 50) return true;
        return false;
      });
    }

    // Size filter
    if (filters.size.length > 0) {
      filtered = filtered.filter(investor => {
        if (filters.size.includes('Small (<$1K)') && investor.totalInvestment < 1000) return true;
        if (filters.size.includes('Medium ($1K-$5K)') && investor.totalInvestment >= 1000 && investor.totalInvestment <= 5000) return true;
        if (filters.size.includes('Large (>$5K)') && investor.totalInvestment > 5000) return true;
        return false;
      });
    }

    // AUM% filter
    if (filters.aum.length > 0) {
      filtered = filtered.filter(investor => {
        if (filters.aum.includes('Minor (<5%)') && investor.shareOfAUM < 5) return true;
        if (filters.aum.includes('Moderate (5-20%)') && investor.shareOfAUM >= 5 && investor.shareOfAUM <= 20) return true;
        if (filters.aum.includes('Major (>20%)') && investor.shareOfAUM > 20) return true;
        return false;
      });
    }

    return filtered;
  }, [searchTerm, filters]);

  // Sort logic
  const sortedInvestors = useMemo(() => {
    if (!sortColumn) return filteredInvestors;

    return [...filteredInvestors].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }, [filteredInvestors, sortColumn, sortDirection]);

  const handleSort = (column: keyof Investor) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterToggle = (type: FilterType, value: FilterValue) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      returns: [],
      size: [],
      aum: []
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0B0B' }}>
      {/* Header */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#00FF95' }}>
          Investors
        </h1>
        <p style={{ color: '#A0A0A0' }}>
          Manage and track investor portfolios
        </p>
      </div>

      {/* Filters Row */}
      <div className="px-6 mb-6">
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: '#1A1F1A' }}>
          {/* Search Box */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border transition-all duration-200"
              style={{
                backgroundColor: '#2A2A2A',
                borderColor: '#404040',
                color: '#FFFFFF',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00FF95';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 255, 149, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#404040';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap gap-6">
            {/* Returns Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: '#A0A0A0' }}>
                RETURNS
              </label>
              <div className="flex gap-2">
                {['Positive', 'Negative', 'High (50%+)'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterToggle('returns', filter)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.returns.includes(filter)
                        ? 'text-white'
                        : 'text-gray-400 border border-gray-400'
                    }`}
                    style={{
                      backgroundColor: filters.returns.includes(filter) ? '#00FF95' : 'transparent',
                      borderColor: filters.returns.includes(filter) ? '#00FF95' : '#666666'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: '#A0A0A0' }}>
                SIZE
              </label>
              <div className="flex gap-2">
                {['Small (<$1K)', 'Medium ($1K-$5K)', 'Large (>$5K)'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterToggle('size', filter)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.size.includes(filter)
                        ? 'text-white'
                        : 'text-gray-400 border border-gray-400'
                    }`}
                    style={{
                      backgroundColor: filters.size.includes(filter) ? '#00FF95' : 'transparent',
                      borderColor: filters.size.includes(filter) ? '#00FF95' : '#666666'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* AUM% Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: '#A0A0A0' }}>
                AUM %
              </label>
              <div className="flex gap-2">
                {['Minor (<5%)', 'Moderate (5-20%)', 'Major (>20%)'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterToggle('aum', filter)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.aum.includes(filter)
                        ? 'text-white'
                        : 'text-gray-400 border border-gray-400'
                    }`}
                    style={{
                      backgroundColor: filters.aum.includes(filter) ? '#00FF95' : 'transparent',
                      borderColor: filters.aum.includes(filter) ? '#00FF95' : '#666666'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clear All Button */}
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#666666',
              color: '#A0A0A0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00FF95';
              e.currentTarget.style.color = '#00FF95';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#666666';
              e.currentTarget.style.color = '#A0A0A0';
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Investor Table */}
      <div className="px-6">
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#1A1F1A' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#2A2A2A' }}>
                  {[
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'NAME' },
                    { key: 'initialInvestmentDate', label: 'INITIAL INVESTMENT DATE' },
                    { key: 'totalInvestment', label: 'TOTAL INVESTMENT ($)' },
                    { key: 'currentValue', label: 'CURRENT VALUE ($)' },
                    { key: 'shareOfAUM', label: 'SHARE OF AUM (%)' },
                    { key: 'return', label: 'RETURN (%)' },
                    { key: 'actions', label: '' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      style={{ color: '#A0A0A0' }}
                      onClick={() => key !== 'actions' && handleSort(key as keyof Investor)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key !== 'actions' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedInvestors.map((investor, index) => (
                  <tr
                    key={investor.id}
                    className="transition-all duration-200 hover:bg-opacity-10"
                    style={{
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                      borderBottom: '1px solid #333'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 255, 149, 0.05)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 149, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#FFFFFF' }}>
                      {investor.id}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                      {investor.name}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#A0A0A0' }}>
                      {investor.initialInvestmentDate}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                      {formatCurrency(investor.totalInvestment)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#FFFFFF' }}>
                      {formatCurrency(investor.currentValue)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#A0A0A0' }}>
                      {investor.shareOfAUM.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: investor.return >= 0 ? '#00FF95' : '#FF4D4D' }}>
                      {formatPercentage(investor.return)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedInvestor(investor)}
                        className="px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: '#666666',
                          color: '#A0A0A0'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#00FF95';
                          e.currentTarget.style.color = '#00FF95';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#666666';
                          e.currentTarget.style.color = '#A0A0A0';
                        }}
                      >
                        More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Investor Detail Modal */}
      {selectedInvestor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#00FF95' }}>
                  {selectedInvestor.name}
                </h2>
                <button
                  onClick={() => setSelectedInvestor(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                    Investment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Investor ID:</span>
                      <span style={{ color: '#FFFFFF' }}>{selectedInvestor.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Initial Investment:</span>
                      <span style={{ color: '#FFFFFF' }}>{formatCurrency(selectedInvestor.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Current Value:</span>
                      <span style={{ color: '#FFFFFF' }}>{formatCurrency(selectedInvestor.currentValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Return:</span>
                      <span style={{ color: selectedInvestor.return >= 0 ? '#00FF95' : '#FF4D4D' }}>
                        {formatPercentage(selectedInvestor.return)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                    Portfolio Share
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Share of AUM:</span>
                      <span style={{ color: '#FFFFFF' }}>{selectedInvestor.shareOfAUM.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#A0A0A0' }}>Investment Date:</span>
                      <span style={{ color: '#FFFFFF' }}>{selectedInvestor.initialInvestmentDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
