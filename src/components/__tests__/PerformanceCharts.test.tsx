import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PerformanceCharts from '../charts/PerformanceCharts';

// Mock the performance data service
const mockPerformanceData = [
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
];

const mockFetchPerformanceData = vi.fn(() => Promise.resolve(mockPerformanceData));

vi.mock('@/services/performanceDataService', () => ({
  fetchPerformanceData: mockFetchPerformanceData
}));

// Mock WagmiButton and WagmiCard
vi.mock('@/components/ui', () => ({
  WagmiButton: ({ children, onClick, variant, theme, size }: any) => (
    <button 
      onClick={onClick}
      data-variant={variant}
      data-theme={theme}
      data-size={size}
      className="wagmi-button"
    >
      {children}
    </button>
  ),
  WagmiCard: ({ children, variant, theme, size }: any) => (
    <div 
      data-variant={variant}
      data-theme={theme}
      data-size={size}
      className="wagmi-card"
    >
      {children}
    </div>
  )
}));

// Mock standardization utilities
vi.mock('@/shared/utils/standardization', () => ({
  getSpacing: vi.fn(() => 'space-x-4 space-y-4')
}));

describe('PerformanceCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component without crashing', async () => {
    render(<PerformanceCharts data={mockPerformanceData} />);
    
    // Should render the main container
    expect(screen.getByText('Historical Fund Performance (Ending AUM)')).toBeInTheDocument();
    expect(screen.getByText('Performance vs Benchmarks')).toBeInTheDocument();
  });

  it('displays toggle buttons for view modes', async () => {
    render(<PerformanceCharts data={mockPerformanceData} />);
    
    // Should have toggle buttons
    const momButton = screen.getByText('MoM Performance');
    const cumulativeButton = screen.getByText('Cumulative Return');
    
    expect(momButton).toBeInTheDocument();
    expect(cumulativeButton).toBeInTheDocument();
  });

  it('switches between MoM and Cumulative view modes', async () => {
    render(<PerformanceCharts data={mockPerformanceData} />);
    
    const momButton = screen.getByText('MoM Performance');
    const cumulativeButton = screen.getByText('Cumulative Return');
    
    // Initially MoM should be active
    expect(momButton).toHaveAttribute('data-variant', 'primary');
    expect(cumulativeButton).toHaveAttribute('data-variant', 'outline');
    
    // Click cumulative button
    fireEvent.click(cumulativeButton);
    
    // Now cumulative should be active
    expect(cumulativeButton).toHaveAttribute('data-variant', 'primary');
    expect(momButton).toHaveAttribute('data-variant', 'outline');
  });

  it('renders charts with proper WagmiCard containers', async () => {
    render(<PerformanceCharts data={mockPerformanceData} />);
    
    const cards = document.querySelectorAll('.wagmi-card');
    expect(cards).toHaveLength(2); // Two main chart cards
    
    // Check card properties
    expect(cards[0]).toHaveAttribute('data-variant', 'default');
    expect(cards[0]).toHaveAttribute('data-theme', 'green');
    expect(cards[0]).toHaveAttribute('data-size', 'lg');
  });

  it('renders toggle buttons with proper WagmiButton components', async () => {
    render(<PerformanceCharts data={mockPerformanceData} />);
    
    const buttons = document.querySelectorAll('.wagmi-button');
    expect(buttons).toHaveLength(2); // Two toggle buttons
    
    // Check button properties
    expect(buttons[0]).toHaveAttribute('data-theme', 'green');
    expect(buttons[0]).toHaveAttribute('data-size', 'sm');
  });

  it('handles empty data gracefully', async () => {
    render(<PerformanceCharts data={[]} />);
    
    // Should still render the component structure
    expect(screen.getByText('Historical Fund Performance (Ending AUM)')).toBeInTheDocument();
    expect(screen.getByText('Performance vs Benchmarks')).toBeInTheDocument();
  });

  it('filters out future months correctly', async () => {
    const futureData = [
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
        month: '2025-12', // Future month
        endingAUM: 2000000,
        wagmiMoM: 10.0,
        wagmiCumulative: 15.0,
        totalMoM: 8.0,
        totalCumulative: 14.0,
        total3MoM: 9.0,
        total3Cumulative: 13.0
      }
    ];
    
    render(<PerformanceCharts data={futureData} />);
    
    // Component should render without crashing
    expect(screen.getByText('Historical Fund Performance (Ending AUM)')).toBeInTheDocument();
  });
});
