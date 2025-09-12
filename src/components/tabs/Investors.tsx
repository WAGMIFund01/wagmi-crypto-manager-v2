'use client';

import { useState, useEffect, useMemo } from 'react';
import TransactionModal from '@/components/TransactionModal';
import { WagmiInput, FilterGroup, FilterChip } from '@/components/ui';

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
  onRefresh?: number;
}

export default function Investors({ isPrivacyMode = false, onRefresh }: InvestorsProps) {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    returns: [] as string[],
    size: [] as string[],
    share: [] as string[]
  });

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      setError(null);
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

  // Fetch investor data on component mount
  useEffect(() => {
    fetchInvestors();
  }, []);

  // Refresh when onRefresh trigger changes
  useEffect(() => {
    if (onRefresh !== undefined) {
      fetchInvestors();
    }
  }, [onRefresh]);

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

  // Filter options
  const filterOptions = {
    returns: [
      { value: 'positive', label: 'Positive' },
      { value: 'negative', label: 'Negative' },
      { value: 'high', label: 'High (>50%)' }
    ],
    size: [
      { value: 'small', label: 'Small (<$1K)' },
      { value: 'medium', label: 'Medium ($1K-5K)' },
      { value: 'large', label: 'Large (>5K)' }
    ],
    share: [
      { value: 'minor', label: 'Minor (<5%)' },
      { value: 'moderate', label: 'Moderate (5-20%)' },
      { value: 'major', label: 'Major (>20%)' }
    ]
  };

  // Filter toggle function
  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      returns: [],
      size: [],
      share: []
    });
    setSearchQuery('');
  };

  // Filtered investors based on search and filters
  const filteredInvestors = useMemo(() => {
    let filtered = investors;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(investor =>
        investor.name.toLowerCase().includes(query) ||
        investor.id.toLowerCase().includes(query) ||
        investor.investmentValue.toString().includes(query)
      );
    }

    // Returns filter
    if (filters.returns.length > 0) {
      filtered = filtered.filter(investor => {
        const returnPct = investor.returnPercentage;
        return filters.returns.some(filter => {
          switch (filter) {
            case 'positive': return returnPct > 0;
            case 'negative': return returnPct < 0;
            case 'high': return returnPct > 50;
            default: return false;
          }
        });
      });
    }

    // Size filter
    if (filters.size.length > 0) {
      filtered = filtered.filter(investor => {
        const investment = investor.investmentValue;
        return filters.size.some(filter => {
          switch (filter) {
            case 'small': return investment < 1000;
            case 'medium': return investment >= 1000 && investment <= 5000;
            case 'large': return investment > 5000;
            default: return false;
          }
        });
      });
    }

    // Share % filter
    if (filters.share.length > 0) {
      filtered = filtered.filter(investor => {
        const sharePct = investor.sharePercentage * 100; // Convert decimal to percentage
        return filters.share.some(filter => {
          switch (filter) {
            case 'minor': return sharePct < 5;
            case 'moderate': return sharePct >= 5 && sharePct <= 20;
            case 'major': return sharePct > 20;
            default: return false;
          }
        });
      });
    }

    return filtered;
  }, [investors, searchQuery, filters]);

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
    <div className="space-y-4">
      {/* Unified Search and Filter Row */}
      <div>
        {/* Desktop: Natural content-based layout */}
        <div className="hidden lg:flex lg:items-end lg:space-x-4">
          {/* Search Bar - natural width */}
          <div className="w-52 flex-shrink-0">
            <WagmiInput
              variant="search"
              placeholder="Search investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              theme="green"
              size="md"
            />
          </div>

          {/* Filter Groups - flexible space */}
          <div className="flex space-x-4">
            <FilterGroup
              title="Returns"
              options={filterOptions.returns}
              selectedValues={filters.returns}
              onToggle={(value) => toggleFilter('returns', value)}
            />
            <FilterGroup
              title="Size"
              options={filterOptions.size}
              selectedValues={filters.size}
              onToggle={(value) => toggleFilter('size', value)}
            />
            <FilterGroup
              title="Share %"
              options={filterOptions.share}
              selectedValues={filters.share}
              onToggle={(value) => toggleFilter('share', value)}
            />
          </div>

          {/* Clear All - natural width */}
          <div className="w-20 flex-shrink-0 flex justify-center">
            <FilterChip
              label="Clear All"
              isActive={false}
              onClick={clearAllFilters}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
            />
          </div>
        </div>

        {/* Tablet: Search + Wrapping chips */}
        <div className="hidden md:flex md:flex-col lg:hidden space-y-4">
          {/* Search Bar */}
          <div className="w-full max-w-sm">
            <WagmiInput
              variant="search"
              placeholder="Search investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              theme="green"
              size="md"
            />
          </div>

          {/* Filter Groups with wrapping */}
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
            <FilterGroup
              title="Returns"
              options={filterOptions.returns}
              selectedValues={filters.returns}
              onToggle={(value) => toggleFilter('returns', value)}
              className="flex-shrink-0"
            />
            <FilterGroup
              title="Size"
              options={filterOptions.size}
              selectedValues={filters.size}
              onToggle={(value) => toggleFilter('size', value)}
              className="flex-shrink-0"
            />
            <FilterGroup
              title="Share %"
              options={filterOptions.share}
              selectedValues={filters.share}
              onToggle={(value) => toggleFilter('share', value)}
              className="flex-shrink-0"
            />
            <div className="flex-shrink-0 flex items-end">
              <FilterChip
                label="Clear All"
                isActive={false}
                onClick={clearAllFilters}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
              />
            </div>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="flex flex-col md:hidden space-y-4">
          {/* Search Bar */}
          <div className="w-full">
            <WagmiInput
              variant="search"
              placeholder="Search investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              theme="green"
              size="md"
            />
          </div>

          {/* Filter Groups */}
          <div className="space-y-4">
            <FilterGroup
              title="Returns"
              options={filterOptions.returns}
              selectedValues={filters.returns}
              onToggle={(value) => toggleFilter('returns', value)}
            />
            <FilterGroup
              title="Size"
              options={filterOptions.size}
              selectedValues={filters.size}
              onToggle={(value) => toggleFilter('size', value)}
            />
            <FilterGroup
              title="Share %"
              options={filterOptions.share}
              selectedValues={filters.share}
              onToggle={(value) => toggleFilter('share', value)}
            />
            <div className="pt-2">
              <FilterChip
                label="Clear All"
                isActive={false}
                onClick={clearAllFilters}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
              />
            </div>
          </div>
        </div>
      </div>


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
              {filteredInvestors.map((investor, index) => (
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
                  <td className="px-4 py-3 text-sm" style={{ color: isPrivacyMode ? '#FFFFFF' : '#A0A0A0' }}>
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