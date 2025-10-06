import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UniversalNavbar from '../UniversalNavbar';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock KPI data
const mockKpiData = {
  activeInvestors: '5',
  totalAUM: '$1,000,000.00',
  cumulativeReturn: '+15.5%',
  monthOnMonth: '+2.3%',
  lastUpdated: '10/06/2025, 12:00:00'
};

const mockPersonalKpiData = {
  totalAUM: '$60,731.15',
  cumulativeReturn: '+598.3%',
  monthOnMonth: '+69.0%',
  lastUpdated: '10/06/2025, 12:00:00'
};

describe('UniversalNavbar - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  describe('Basic Rendering', () => {
    it('renders WAGMI fund navbar correctly', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
        />
      );
      
      expect(screen.getAllByText('WAGMI')).toHaveLength(2); // Mobile and desktop versions
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      expect(screen.getAllByText('Performance')).toHaveLength(2); // Mobile and desktop versions
      expect(screen.getByText('Investors')).toBeInTheDocument();
      expect(screen.getByText('AI Copilot')).toBeInTheDocument();
    });

    it('renders personal portfolio navbar correctly', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockPersonalKpiData}
          dataSource="personal-portfolio"
        />
      );
      
      expect(screen.getAllByText('WAGMI')).toHaveLength(2); // Mobile and desktop versions
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      expect(screen.getAllByText('Performance')).toHaveLength(2); // Mobile and desktop versions
      expect(screen.queryByText('Investors')).not.toBeInTheDocument();
      expect(screen.queryByText('AI Copilot')).not.toBeInTheDocument();
    });

    it('renders household navbar correctly', () => {
      render(
        <UniversalNavbar
          activeTab="analytics"
          onTabChange={vi.fn()}
          kpiData={mockPersonalKpiData}
          dataSource="household"
        />
      );
      
      expect(screen.getAllByText('WAGMI')).toHaveLength(2); // Mobile and desktop versions
      expect(screen.getAllByText('Wifey Crypto Dashboard')).toHaveLength(2); // Mobile and desktop versions
      expect(screen.queryByText('Portfolio Overview')).not.toBeInTheDocument();
    });
  });

  describe('KPI Display', () => {
    it('shows all KPIs for WAGMI fund', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
        />
      );
      
      expect(screen.getByText('Active Investors')).toBeInTheDocument();
      expect(screen.getByText('Total AUM')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
    });

    it('hides Active Investors for personal portfolio', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockPersonalKpiData}
          dataSource="personal-portfolio"
        />
      );
      
      expect(screen.queryByText('Active Investors')).not.toBeInTheDocument();
      expect(screen.getByText('Total AUM')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
    });

    it('hides Active Investors for household', () => {
      render(
        <UniversalNavbar
          activeTab="analytics"
          onTabChange={vi.fn()}
          kpiData={mockPersonalKpiData}
          dataSource="household"
        />
      );
      
      expect(screen.queryByText('Active Investors')).not.toBeInTheDocument();
      expect(screen.getByText('Total AUM')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
    });
  });

  describe('Module Selector Visibility', () => {
    it('shows module selector for WAGMI fund by default', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
        />
      );
      
      const moduleSelectorButtons = screen.getAllByTitle('Module Selector');
      expect(moduleSelectorButtons.length).toBeGreaterThan(0);
    });

    it('shows module selector for personal portfolio by default', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockPersonalKpiData}
          dataSource="personal-portfolio"
        />
      );
      
      const moduleSelectorButtons = screen.getAllByTitle('Module Selector');
      expect(moduleSelectorButtons.length).toBeGreaterThan(0);
    });

    it('hides module selector when showModuleSelector is false', () => {
      render(
        <UniversalNavbar
          activeTab="analytics"
          onTabChange={vi.fn()}
          kpiData={mockPersonalKpiData}
          dataSource="household"
          showModuleSelector={false}
        />
      );
      
      const moduleSelectorButtons = screen.queryAllByTitle('Module Selector');
      expect(moduleSelectorButtons).toHaveLength(0);
    });

    it('shows module selector when showModuleSelector is true for household', () => {
      render(
        <UniversalNavbar
          activeTab="analytics"
          onTabChange={vi.fn()}
          kpiData={mockPersonalKpiData}
          dataSource="household"
          showModuleSelector={true}
        />
      );
      
      const moduleSelectorButtons = screen.getAllByTitle('Module Selector');
      expect(moduleSelectorButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Tab Navigation', () => {
    it('calls onTabChange when tab is clicked', () => {
      const mockOnTabChange = vi.fn();
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={mockOnTabChange}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
        />
      );
      
      const performanceTab = screen.getByText('Performance');
      fireEvent.click(performanceTab);
      
      expect(mockOnTabChange).toHaveBeenCalledWith('analytics');
    });

    it('highlights active tab correctly', () => {
      render(
        <UniversalNavbar
          activeTab="analytics"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
        />
      );
      
      const performanceTab = screen.getByText('Performance');
      expect(performanceTab).toHaveStyle('color: #00FF95');
    });
  });

  describe('Refresh Functionality', () => {
    it('calls onKpiRefresh when refresh button is clicked', async () => {
      const mockOnKpiRefresh = vi.fn().mockResolvedValue(undefined);
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
          onKpiRefresh={mockOnKpiRefresh}
        />
      );
      
      const refreshButton = screen.getByTitle('Refresh Data');
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockOnKpiRefresh).toHaveBeenCalled();
      });
    });

    it('shows loading state during refresh', async () => {
      const mockOnKpiRefresh = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
          onKpiRefresh={mockOnKpiRefresh}
        />
      );
      
      const refreshButton = screen.getByTitle('Refresh Data');
      fireEvent.click(refreshButton);
      
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Privacy Mode', () => {
    it('toggles privacy mode correctly', () => {
      const mockOnPrivacyModeChange = vi.fn();
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
          onPrivacyModeChange={mockOnPrivacyModeChange}
        />
      );
      
      const privacyButton = screen.getByTitle('Privacy Mode');
      fireEvent.click(privacyButton);
      
      expect(mockOnPrivacyModeChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Error Handling', () => {
    it('displays error state when hasError is true', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={null}
          dataSource="wagmi-fund"
          hasError={true}
        />
      );
      
      expect(screen.getByText('KPI Data Unavailable')).toBeInTheDocument();
    });

    it('handles missing KPI data gracefully', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={null}
          dataSource="wagmi-fund"
        />
      );
      
      expect(screen.getAllByText('WAGMI')).toHaveLength(2); // Mobile and desktop versions
    });
  });

  describe('Mobile Responsiveness', () => {
    it('renders mobile navigation correctly', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
        />
      );
      
      // Should have mobile-specific classes
      const mobileNav = screen.getByLabelText('Mobile navigation');
      expect(mobileNav).toBeInTheDocument();
    });

    it('renders desktop navigation correctly', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
        />
      );
      
      // Should have desktop-specific classes
      const desktopNav = screen.getByLabelText('Desktop navigation');
      expect(desktopNav).toBeInTheDocument();
    });
  });

  describe('Timestamp Display', () => {
    it('displays last updated timestamp', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
        />
      );
      
      expect(screen.getAllByText(/Last updated:/)).toHaveLength(2); // Mobile and desktop versions
    });

    it('shows relative time format', () => {
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="wagmi-fund"
        />
      );
      
      // Should show relative time like "5 minutes ago"
      expect(screen.getAllByText(/ago/)).toHaveLength(2); // Mobile and desktop versions
    });
  });

  describe('Data Source Specific Behavior', () => {
    it('handles performance dashboard data source', () => {
      render(
        <UniversalNavbar
          activeTab="performance"
          onTabChange={vi.fn()}
          kpiData={mockKpiData}
          dataSource="performance-dashboard"
        />
      );
      
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Portfolio Overview')).not.toBeInTheDocument();
    });

    it('handles household data source with custom tab name', () => {
      render(
        <UniversalNavbar
          activeTab="analytics"
          onTabChange={vi.fn()}
          kpiData={mockPersonalKpiData}
          dataSource="household"
        />
      );
      
      expect(screen.getAllByText('Wifey Crypto Dashboard')).toHaveLength(2); // Mobile and desktop versions
    });
  });
});
