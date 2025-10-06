import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EnhancedChartsDemo from '../page';

// Mock the services
vi.mock('@/services/performanceDataService', () => ({
  fetchPerformanceData: vi.fn(() => Promise.resolve([
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
    }
  ]))
}));

vi.mock('@/services/personalPortfolioPerformanceDataService', () => ({
  fetchPersonalPortfolioPerformanceData: vi.fn(() => Promise.resolve([
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
  ]))
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  WagmiSpinner: ({ size }: any) => <div data-testid="spinner" data-size={size}>Loading...</div>,
  WagmiButton: ({ children, onClick, variant, theme, ...props }: any) => (
    <button 
      onClick={onClick}
      data-variant={variant}
      data-theme={theme}
      {...props}
    >
      {children}
    </button>
  ),
  WagmiCard: ({ children, variant, theme, size, className, ...props }: any) => (
    <div 
      data-variant={variant}
      data-theme={theme}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}));

// Mock EnhancedPerformanceCharts
vi.mock('@/components/charts/EnhancedPerformanceCharts', () => ({
  default: ({ data, dataSource }: any) => (
    <div data-testid="enhanced-charts" data-source={dataSource} data-points={data.length}>
      Enhanced Performance Charts
    </div>
  )
}));

describe('Enhanced Charts Demo Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the demo page without crashing', async () => {
    render(<EnhancedChartsDemo />);
    
    await waitFor(() => {
      expect(screen.getByText('Enhanced Performance Charts Demo')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', async () => {
    render(<EnhancedChartsDemo />);
    
    // Should show loading spinner initially
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('loads and displays data after fetching', async () => {
    render(<EnhancedChartsDemo />);
    
    await waitFor(() => {
      expect(screen.getByText('Enhanced Performance Charts Demo')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-charts')).toBeInTheDocument();
    });
  });

  it('shows data source information', async () => {
    render(<EnhancedChartsDemo />);
    
    await waitFor(() => {
      expect(screen.getByText('Data Source Information')).toBeInTheDocument();
      expect(screen.getByText('WAGMI Fund Performance')).toBeInTheDocument();
    });
  });

  it('allows switching between data sources', async () => {
    render(<EnhancedChartsDemo />);
    
    await waitFor(() => {
      expect(screen.getByText('WAGMI Fund')).toBeInTheDocument();
      expect(screen.getByText('Personal Portfolio')).toBeInTheDocument();
    });
    
    // Click Personal Portfolio button
    fireEvent.click(screen.getByText('Personal Portfolio'));
    
    await waitFor(() => {
      expect(screen.getByText('Personal Portfolio Performance')).toBeInTheDocument();
    });
  });

  it('displays feature showcase section', async () => {
    render(<EnhancedChartsDemo />);
    
    await waitFor(() => {
      expect(screen.getByText('New Features Showcase')).toBeInTheDocument();
      expect(screen.getByText('Duration Toggle')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Tooltips')).toBeInTheDocument();
      expect(screen.getByText('Module Support')).toBeInTheDocument();
    });
  });

  it('displays testing instructions', async () => {
    render(<EnhancedChartsDemo />);
    
    await waitFor(() => {
      expect(screen.getByText('Testing Instructions')).toBeInTheDocument();
      expect(screen.getByText('Duration Filters')).toBeInTheDocument();
      expect(screen.getByText('View Modes')).toBeInTheDocument();
      expect(screen.getByText('Data Source Switching')).toBeInTheDocument();
    });
  });

  it('handles refresh functionality', async () => {
    render(<EnhancedChartsDemo />);
    
    await waitFor(() => {
      expect(screen.getByText('Refresh Data')).toBeInTheDocument();
    });
    
    // Click refresh button
    fireEvent.click(screen.getByText('Refresh Data'));
    
    // Should not throw errors
    expect(screen.getByText('Enhanced Performance Charts Demo')).toBeInTheDocument();
  });

  it('shows correct data count', async () => {
    render(<EnhancedChartsDemo />);
    
    await waitFor(() => {
      const enhancedCharts = screen.getByTestId('enhanced-charts');
      expect(enhancedCharts).toHaveAttribute('data-points', '2');
    });
  });

  it('displays mobile testing instructions', async () => {
    render(<EnhancedChartsDemo />);
    
    await waitFor(() => {
      expect(screen.getByText('Mobile Testing')).toBeInTheDocument();
      expect(screen.getByText('Test on mobile devices or use browser dev tools')).toBeInTheDocument();
    });
  });
});
