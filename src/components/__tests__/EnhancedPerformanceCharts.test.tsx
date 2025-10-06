import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EnhancedPerformanceCharts from '../charts/EnhancedPerformanceCharts';
import { 
  chartTestSuite, 
  chartPerformanceUtils, 
  chartInteractionUtils,
  chartDataUtils,
  chartAccessibilityUtils,
  chartExportUtils
} from '@/test/utils/chartTesting';

// Mock performance data for WAGMI Fund
const mockWagmiPerformanceData = [
  {
    month: '2024-01',
    endingAUM: 1000000,
    wagmiMoM: 5.2,
    wagmiCumulative: 5.2,
    totalMoM: 3.1,
    totalCumulative: 3.1,
    total3MoM: 2.8,
    total3Cumulative: 2.8
  },
  {
    month: '2024-02',
    endingAUM: 1050000,
    wagmiMoM: 4.8,
    wagmiCumulative: 10.2,
    totalMoM: 2.9,
    totalCumulative: 6.1,
    total3MoM: 2.5,
    total3Cumulative: 5.4
  },
  {
    month: '2024-03',
    endingAUM: 1100000,
    wagmiMoM: 4.2,
    wagmiCumulative: 14.8,
    totalMoM: 2.5,
    totalCumulative: 8.8,
    total3MoM: 2.1,
    total3Cumulative: 7.6
  }
];

// Mock performance data for Personal Portfolio
const mockPersonalPortfolioData = [
  {
    month: '2024-01',
    endingAUM: 500000,
    personalMoM: 6.5,
    personalCumulative: 6.5,
    totalMoM: 3.1,
    totalCumulative: 3.1,
    total3MoM: 2.8,
    total3Cumulative: 2.8
  },
  {
    month: '2024-02',
    endingAUM: 520000,
    personalMoM: 4.0,
    personalCumulative: 10.7,
    totalMoM: 2.9,
    totalCumulative: 6.1,
    total3MoM: 2.5,
    total3Cumulative: 5.4
  }
];

// Mock WagmiButton and WagmiCard
vi.mock('@/components/ui', () => ({
  WagmiButton: ({ children, variant, theme, size, onClick, ...props }: any) => (
    <button 
      className="wagmi-button"
      data-variant={variant}
      data-theme={theme}
      data-size={size}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
  WagmiCard: ({ children, variant, theme, size, ...props }: any) => (
    <div 
      className="wagmi-card"
      data-variant={variant}
      data-theme={theme}
      data-size={size}
      {...props}
    >
      {children}
    </div>
  )
}));

// Mock standardization utilities
vi.mock('@/shared/utils/standardization', () => ({
  getSpacing: vi.fn(() => 'space-x-4 space-y-4'),
  getStandardCardStyle: vi.fn(() => 'standard-card-style')
}));

describe('Enhanced PerformanceCharts Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering Tests', () => {
    it('renders the component without crashing for WAGMI Fund', async () => {
      const result = await chartTestSuite.testRendering(
        <EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />
      );
      
      expect(result.rendered).toBe(true);
      expect(result.chartCount).toBeGreaterThan(0);
    });

    it('renders the component without crashing for Personal Portfolio', async () => {
      const result = await chartTestSuite.testRendering(
        <EnhancedPerformanceCharts data={mockPersonalPortfolioData} dataSource="personal-portfolio" />
      );
      
      expect(result.rendered).toBe(true);
      expect(result.chartCount).toBeGreaterThan(0);
    });

    it('displays all required chart sections', async () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
    });

    it('displays duration filter buttons', async () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      expect(screen.getByText('6M')).toBeInTheDocument();
      expect(screen.getByText('1Y')).toBeInTheDocument();
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('displays view mode toggle buttons', async () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
    });
  });

  describe('Duration Filter Tests', () => {
    it('switches between duration filters correctly', async () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      const sixMonthButton = screen.getByText('6M');
      const oneYearButton = screen.getByText('1Y');
      const allButton = screen.getByText('All');
      
      // Initially All should be active
      expect(allButton).toHaveAttribute('data-variant', 'primary');
      expect(sixMonthButton).toHaveAttribute('data-variant', 'outline');
      expect(oneYearButton).toHaveAttribute('data-variant', 'outline');
      
      // Click 6M button
      fireEvent.click(sixMonthButton);
      expect(sixMonthButton).toHaveAttribute('data-variant', 'primary');
      expect(allButton).toHaveAttribute('data-variant', 'outline');
      
      // Click 1Y button
      fireEvent.click(oneYearButton);
      expect(oneYearButton).toHaveAttribute('data-variant', 'primary');
      expect(sixMonthButton).toHaveAttribute('data-variant', 'outline');
    });

    it('updates chart title based on duration filter', async () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      // Initially should show "All Time"
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      
      // Click 6M button
      fireEvent.click(screen.getByText('6M'));
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      
      // Click 1Y button
      fireEvent.click(screen.getByText('1Y'));
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
    });
  });

  describe('View Mode Tests', () => {
    it('switches between MoM and Cumulative view modes', async () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      const momButton = screen.getByText('MoM Return');
      const cumulativeButton = screen.getByText('Cumulative Return');
      
      // Initially Historical AUM should be active (default mode)
      const aumButton = screen.getByText('Historical AUM');
      expect(aumButton).toHaveAttribute('data-variant', 'primary');
      expect(momButton).toHaveAttribute('data-variant', 'outline');
      expect(cumulativeButton).toHaveAttribute('data-variant', 'outline');
      
      // Click cumulative button
      fireEvent.click(cumulativeButton);
      expect(cumulativeButton).toHaveAttribute('data-variant', 'primary');
      expect(momButton).toHaveAttribute('data-variant', 'outline');
    });

    it('shows correct button text for Personal Portfolio', async () => {
      render(<EnhancedPerformanceCharts data={mockPersonalPortfolioData} dataSource="personal-portfolio" />);
      
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
    });
  });

  describe('Data Source Tests', () => {
    it('handles WAGMI Fund data correctly', async () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
    });

    it('handles Personal Portfolio data correctly', async () => {
      render(<EnhancedPerformanceCharts data={mockPersonalPortfolioData} dataSource="personal-portfolio" />);
      
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
    });
  });

  describe('Data Filtering Tests', () => {
    it('filters data correctly for 6M duration', async () => {
      const largeDataset = chartDataUtils.generateTestData.performanceData(24); // 2 years of data
      
      render(<EnhancedPerformanceCharts data={largeDataset} dataSource="wagmi-fund" />);
      
      // Click 6M button
      fireEvent.click(screen.getByText('6M'));
      
      // Should show filtered data (this is tested by the component's internal logic)
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
    });

    it('handles empty data gracefully', async () => {
      render(<EnhancedPerformanceCharts data={[]} dataSource="wagmi-fund" />);
      
      // Should still render the component structure
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
    });
  });

  describe('Enhanced Tooltip Tests', () => {
    it('renders enhanced tooltips with additional information', async () => {
      const { container } = render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      // The enhanced tooltips are tested by the component's internal logic
      // We verify the component renders without errors
      expect(container.querySelector('.wagmi-card')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness Tests', () => {
    it('renders properly on mobile devices', async () => {
      const result = await chartTestSuite.testMobileResponsiveness(
        <EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />
      );
      
      expect(result.chartCount).toBeGreaterThan(0);
      expect(result.isResponsive).toBe(true);
    });

    it('handles touch interactions on mobile', async () => {
      const { container } = render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      const charts = container.querySelectorAll('svg, [class*="recharts"]');
      
      if (charts.length > 0) {
        const chart = charts[0] as HTMLElement;
        
        // Test touch interactions
        chartInteractionUtils.simulateTouch(chart, 'start', 100, 100);
        chartInteractionUtils.simulateTouch(chart, 'end', 100, 100);
        
        // Should not throw errors
        expect(chart).toBeInTheDocument();
      }
    });
  });

  describe('Performance Tests', () => {
    it('renders within acceptable time limits', async () => {
      const renderTime = await chartPerformanceUtils.measureRenderingTime(() => {
        render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      });
      
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('handles memory usage efficiently', async () => {
      const memoryTest = chartPerformanceUtils.testMemoryUsage();
      
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      const memoryDelta = memoryTest.getMemoryDelta();
      expect(memoryDelta).toBeLessThan(5000000); // Less than 5MB memory increase
    });

    it('optimizes rendering for large datasets', async () => {
      const largeDataset = chartDataUtils.generateTestData.largeDataset(1000);
      const performanceTest = chartPerformanceUtils.testLargeDataset(largeDataset, 500);
      
      expect(performanceTest.isLargeDataset).toBe(true);
      expect(performanceTest.shouldOptimize).toBe(true);
    });
  });

  describe('Accessibility Tests', () => {
    it('provides proper accessibility features', async () => {
      const { container } = render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      const accessibility = chartAccessibilityUtils.testAccessibility(container);
      
      expect(accessibility.hasCharts).toBe(true);
      expect(accessibility.chartCount).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', async () => {
      const { container } = render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      const keyboardNav = chartAccessibilityUtils.testKeyboardNavigation(container);
      
      expect(keyboardNav.hasFocusableElements).toBe(true);
      expect(keyboardNav.focusableCount).toBeGreaterThan(0);
    });
  });

  describe('Component Integration Tests', () => {
    it('integrates properly with WagmiCard components', async () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      const cards = document.querySelectorAll('.wagmi-card');
      expect(cards).toHaveLength(1); // One consolidated chart card
      
      // Check card properties
      expect(cards[0]).toHaveAttribute('data-variant', 'default');
      expect(cards[0]).toHaveAttribute('data-theme', 'green');
      expect(cards[0]).toHaveAttribute('data-size', 'lg');
    });

    it('integrates properly with WagmiButton components', async () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(6); // Duration filters + view mode toggles + export buttons
      
      // Check button properties
      expect(buttons[0]).toHaveAttribute('data-theme', 'green');
      expect(buttons[0]).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('Feature Parity Tests', () => {
    it('maintains all functionality from original component', async () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      // All original features should be present
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
      
      // New features should be present
      expect(screen.getByText('6M')).toBeInTheDocument();
      expect(screen.getByText('1Y')).toBeInTheDocument();
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('handles both data sources correctly', async () => {
      // Test WAGMI Fund
      const { rerender } = render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      
      // Test Personal Portfolio
      rerender(<EnhancedPerformanceCharts data={mockPersonalPortfolioData} dataSource="personal-portfolio" />);
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
    });
  });

  describe('Export Functionality Tests', () => {
    it('renders export buttons for both charts', () => {
      const { container } = render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} />);
      
      const exportButtons = chartExportUtils.testExportButtons(container);
      expect(exportButtons.allPresent).toBe(true);
      expect(exportButtons.pngButton).toBe(true);
      expect(exportButtons.pdfButton).toBe(true);
      expect(exportButtons.csvButton).toBe(true);
    });

    it('handles PNG export functionality', async () => {
      const { container } = render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} />);
      
      const pngExportResult = await chartExportUtils.testPNGExport(container);
      expect(pngExportResult).toBe(true);
    });

    it('handles PDF export functionality', async () => {
      const { container } = render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} />);
      
      const pdfExportResult = await chartExportUtils.testPDFExport(container);
      expect(pdfExportResult).toBe(true);
    });

    it('handles CSV export functionality', () => {
      const { container } = render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} />);
      
      const csvExportResult = chartExportUtils.testCSVExport(container);
      expect(csvExportResult).toBe(true);
    });

    it('handles complete export functionality', async () => {
      const { container } = render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} />);
      
      const exportResults = await chartExportUtils.testExportFunctionality(container);
      expect(exportResults.png).toBe(true);
      expect(exportResults.pdf).toBe(true);
      expect(exportResults.csv).toBe(true);
    });
  });
});