import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EnhancedPerformanceCharts from '../charts/EnhancedPerformanceCharts';

// Mock performance data for WAGMI Fund
const mockWagmiPerformanceData = [
  {
    month: 'Oct-2024',
    endingAUM: 6264.09,
    wagmiMoM: 28.5,
    wagmiCumulative: 28.5,
    totalMoM: 11.59,
    totalCumulative: 11.59,
    total3MoM: 3.75,
    total3Cumulative: 3.75
  },
  {
    month: 'Nov-2024',
    endingAUM: 18686.35,
    wagmiMoM: 6.2,
    wagmiCumulative: 15.3,
    totalMoM: 46.75,
    totalCumulative: 46.75,
    total3MoM: 77.63,
    total3Cumulative: 77.63
  }
];

// Mock performance data for Personal Portfolio
const mockPersonalPortfolioData = [
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

// Mock data for household module (same as personal portfolio)
const mockHouseholdData = mockPersonalPortfolioData;

describe('EnhancedPerformanceCharts - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders WAGMI Fund charts correctly', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      expect(screen.getByText('Historical AUM')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
    });

    it('renders Personal Portfolio charts correctly', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockPersonalPortfolioData} 
          dataSource="personal-portfolio" 
        />
      );
      
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      expect(screen.getByText('Historical AUM')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
      expect(screen.getByText('Investment')).toBeInTheDocument();
    });

    it('renders with custom title when provided', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund"
          customTitle="Fund Performance vs Benchmarks"
        />
      );
      
      expect(screen.getByText('Fund Performance vs Benchmarks')).toBeInTheDocument();
    });

    it('hides AUM selector when hideAumSelector is true', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund"
          hideAumSelector={true}
        />
      );
      
      expect(screen.queryByText('Historical AUM')).not.toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
    });
  });

  describe('Chart Mode Functionality', () => {
    it('switches between chart modes correctly', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      // Default should be Historical AUM
      const aumButton = screen.getByText('Historical AUM');
      expect(aumButton).toHaveClass('bg-green-500');
      
      // Click MoM Return
      const momButton = screen.getByText('MoM Return');
      fireEvent.click(momButton);
      expect(momButton).toHaveClass('bg-green-500');
      expect(aumButton).toHaveClass('border-green-500');
    });

    it('shows Investment mode only for personal portfolio', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockPersonalPortfolioData} 
          dataSource="personal-portfolio" 
        />
      );
      
      expect(screen.getByText('Investment')).toBeInTheDocument();
    });

    it('does not show Investment mode for WAGMI fund', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      expect(screen.queryByText('Investment')).not.toBeInTheDocument();
    });
  });

  describe('Duration Filtering', () => {
    it('applies duration filters correctly', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      // Default should be All
      const allButton = screen.getByText('All');
      expect(allButton).toHaveClass('bg-green-500');
      
      // Click 6M
      const sixMonthButton = screen.getByText('6M');
      fireEvent.click(sixMonthButton);
      expect(sixMonthButton).toHaveClass('bg-green-500');
      expect(allButton).toHaveClass('border-green-500');
    });
  });

  describe('Export Functionality', () => {
    it('renders export buttons', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    it('handles PNG export', async () => {
      // Mock html-to-image
      const mockToPng = vi.fn().mockResolvedValue('data:image/png;base64,test');
      vi.doMock('html-to-image', () => ({
        toPng: mockToPng
      }));

      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      const pngButton = screen.getByText('PNG');
      fireEvent.click(pngButton);
      
      await waitFor(() => {
        expect(mockToPng).toHaveBeenCalled();
      });
    });
  });

  describe('Date Alignment', () => {
    it('correctly displays month labels', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      // Should show the correct month labels from the data
      expect(screen.getByText('Oct-2024')).toBeInTheDocument();
      expect(screen.getByText('Nov-2024')).toBeInTheDocument();
    });

    it('correctly displays personal portfolio month labels', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockPersonalPortfolioData} 
          dataSource="personal-portfolio" 
        />
      );
      
      // Should show the correct month labels from the data
      expect(screen.getByText('Jun-2021')).toBeInTheDocument();
      expect(screen.getByText('Jul-2021')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('applies mobile-specific classes', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      const chartContainer = screen.getByTestId('enhanced-performance-charts');
      expect(chartContainer).toHaveClass('flex-shrink-0', 'min-w-[60px]', 'touch-manipulation');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      const chartContainer = screen.getByTestId('enhanced-performance-charts');
      expect(chartContainer).toHaveAttribute('role', 'img');
      expect(chartContainer).toHaveAttribute('aria-label');
    });

    it('has keyboard navigation support', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex');
      });
    });
  });

  describe('Data Source Specific Behavior', () => {
    it('handles WAGMI fund data correctly', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockWagmiPerformanceData} 
          dataSource="wagmi-fund" 
        />
      );
      
      // Should show WAGMI-specific data
      expect(screen.getByText('Historical AUM')).toBeInTheDocument();
    });

    it('handles personal portfolio data correctly', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockPersonalPortfolioData} 
          dataSource="personal-portfolio" 
        />
      );
      
      // Should show personal portfolio-specific data including Investment
      expect(screen.getByText('Investment')).toBeInTheDocument();
    });

    it('handles household data correctly', () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockHouseholdData} 
          dataSource="personal-portfolio" 
        />
      );
      
      // Household uses same data structure as personal portfolio
      expect(screen.getByText('Investment')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles empty data gracefully', () => {
      render(
        <EnhancedPerformanceCharts 
          data={[]} 
          dataSource="wagmi-fund" 
        />
      );
      
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
    });

    it('handles malformed data gracefully', () => {
      const malformedData = [
        { 
          month: 'Invalid', 
          endingAUM: 1000,
          wagmiMoM: 0,
          wagmiCumulative: 0,
          totalMoM: 0,
          totalCumulative: 0,
          total3MoM: 0,
          total3Cumulative: 0
        }
      ];
      
      render(
        <EnhancedPerformanceCharts 
          data={malformedData} 
          dataSource="wagmi-fund" 
        />
      );
      
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
    });
  });
});
