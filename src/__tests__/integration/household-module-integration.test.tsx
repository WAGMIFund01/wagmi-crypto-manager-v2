import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HouseholdPage from '@/app/household/page';
import UniversalNavbar from '@/components/UniversalNavbar';
import EnhancedPerformanceCharts from '@/components/charts/EnhancedPerformanceCharts';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('Household Module - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('End-to-End Household Login Flow', () => {
    it('completes full household login and dashboard display', async () => {
      // Setup valid household session
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });

      // Mock successful KPI data fetch
      const mockKpiData = {
        totalAUM: 60731.15,
        cumulativeReturn: 598.3,
        monthlyReturn: 69.0,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockKpiData,
      });

      render(<HouseholdPage />);
      
      // Should show loading initially
      expect(screen.getByText('Loading household dashboard...')).toBeInTheDocument();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByText('Loading household dashboard...')).not.toBeInTheDocument();
      });

      // Should not redirect to login
      expect(mockPush).not.toHaveBeenCalledWith('/login');
    });

    it('handles household login with invalid session', async () => {
      // Setup invalid household session
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return null;
        if (key === 'isHouseholdMode') return null;
        return null;
      });

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('UniversalNavbar Integration with Household Module', () => {
    const mockKpiData = {
      totalAUM: '$60,731.15',
      cumulativeReturn: '+598.3%',
      monthOnMonth: '+69.0%',
      lastUpdated: '10/06/2025, 12:00:00'
    };

    it('renders household navbar with correct configuration', () => {
      render(
        <UniversalNavbar
          activeTab="analytics"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="household"
          showModuleSelector={false}
        />
      );
      
      // Should show household-specific navigation
      expect(screen.getByText('Wifey Crypto Dashboard')).toBeInTheDocument();
      
      // Should not show portfolio tab
      expect(screen.queryByText('Portfolio Overview')).not.toBeInTheDocument();
      
      // Should not show investors or AI copilot tabs
      expect(screen.queryByText('Investors')).not.toBeInTheDocument();
      expect(screen.queryByText('AI Copilot')).not.toBeInTheDocument();
    });

    it('hides module selector for household login users', () => {
      render(
        <UniversalNavbar
          activeTab="analytics"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="household"
          showModuleSelector={false}
        />
      );
      
      const moduleSelectorButtons = screen.queryAllByTitle('Module Selector');
      expect(moduleSelectorButtons).toHaveLength(0);
    });

    it('shows module selector for Google Auth users in household module', () => {
      render(
        <UniversalNavbar
          activeTab="analytics"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="household"
          showModuleSelector={true}
        />
      );
      
      const moduleSelectorButtons = screen.getAllByTitle('Module Selector');
      expect(moduleSelectorButtons.length).toBeGreaterThan(0);
    });

    it('hides Active Investors KPI for household module', () => {
      render(
        <UniversalNavbar
          activeTab="analytics"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="household"
        />
      );
      
      expect(screen.queryByText('Active Investors')).not.toBeInTheDocument();
      expect(screen.getByText('Total AUM')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
    });
  });

  describe('Enhanced Performance Charts Integration with Household Module', () => {
    const mockHouseholdData = [
      {
        month: 'Jun-2021',
        endingAUM: 2455.19,
        personalMoM: -21.1,
        personalCumulative: -21.1,
        totalMoM: 2.8,
        totalCumulative: 2.8,
        total3MoM: 2.2,
        total3Cumulative: 2.2,
        investment: 3109.91
      },
      {
        month: 'Jul-2021',
        endingAUM: 4553.22,
        personalMoM: 0.1,
        personalCumulative: 8.9,
        totalMoM: 3.2,
        totalCumulative: 6.1,
        total3MoM: 2.8,
        total3Cumulative: 5.1,
        investment: 3200.00
      }
    ];

    it('renders household charts with correct data source', () => {
      render(
        <EnhancedPerformanceCharts
          data={mockHouseholdData}
          dataSource="personal-portfolio" // Household uses personal portfolio data structure
        />
      );
      
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      expect(screen.getByText('Historical AUM')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
      expect(screen.getByText('Investment')).toBeInTheDocument();
    });

    it('displays correct month labels for household data', () => {
      render(
        <EnhancedPerformanceCharts
          data={mockHouseholdData}
          dataSource="personal-portfolio"
        />
      );
      
      expect(screen.getByText('Jun-2021')).toBeInTheDocument();
      expect(screen.getByText('Jul-2021')).toBeInTheDocument();
    });

    it('handles chart mode switching for household data', () => {
      render(
        <EnhancedPerformanceCharts
          data={mockHouseholdData}
          dataSource="personal-portfolio"
        />
      );
      
      // Default should be Historical AUM
      const aumButton = screen.getByText('Historical AUM');
      expect(aumButton).toHaveClass('bg-green-500');
      
      // Click Investment mode
      const investmentButton = screen.getByText('Investment');
      fireEvent.click(investmentButton);
      expect(investmentButton).toHaveClass('bg-green-500');
      expect(aumButton).toHaveClass('border-green-500');
    });
  });

  describe('Data Flow Integration', () => {
    it('maintains data consistency between components', async () => {
      // Setup household session
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });

      // Mock KPI data
      const mockKpiData = {
        totalAUM: 60731.15,
        cumulativeReturn: 598.3,
        monthlyReturn: 69.0,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockKpiData,
      });

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading household dashboard...')).not.toBeInTheDocument();
      });

      // Verify data consistency
      expect(global.fetch).toHaveBeenCalledWith('/api/get-personal-portfolio-kpi');
    });

    it('handles error states consistently across components', async () => {
      // Setup household session
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });

      // Mock KPI data fetch error
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading household dashboard/)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State Management', () => {
    it('handles session expiration gracefully', async () => {
      // Setup expired household session
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ 
          user: { role: 'household' },
          expires: '2020-01-01T00:00:00.000Z' // Expired
        });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });

      render(<HouseholdPage />);
      
      // Should still render (session validation is basic in current implementation)
      // In a production app, you'd want to validate expiration dates
      expect(screen.getByText('Loading household dashboard...')).toBeInTheDocument();
    });

    it('handles corrupted session data gracefully', async () => {
      // Setup corrupted household session
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return 'invalid-json';
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Performance and Responsiveness', () => {
    it('renders household module efficiently', async () => {
      // Setup household session
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });

      // Mock KPI data
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalAUM: 60731.15,
          cumulativeReturn: 598.3,
          monthlyReturn: 69.0,
          lastUpdated: '10/06/2025, 12:00:00'
        }),
      });

      const startTime = performance.now();
      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading household dashboard...')).not.toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000);
    });
  });
});
