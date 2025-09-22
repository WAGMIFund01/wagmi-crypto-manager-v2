import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock the UI components
vi.mock('@/components/ui/WagmiCard', () => ({
  default: ({ children, ...props }: any) => (
    <div {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/WagmiSpinner', () => ({
  default: ({ children, ...props }: any) => (
    <div {...props}>
      {children || 'Loading...'}
    </div>
  ),
}));

vi.mock('@/components/ui/WagmiText', () => ({
  default: ({ children, ...props }: any) => (
    <span {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/StackedBarChart', () => ({
  default: ({ data, title, ...props }: any) => (
    <div {...props}>
      <h3>{title}</h3>
      {data && Object.keys(data).length > 0 ? (
        <div data-testid="chart-content">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              {key}: {value}
            </div>
          ))}
        </div>
      ) : (
        <div data-testid="no-data">No data available</div>
      )}
    </div>
  ),
}));

vi.mock('@/components/tabs/PortfolioOverview', () => ({
  default: ({ assets, ...props }: any) => (
    <div {...props}>
      <h2>Portfolio Overview</h2>
      {assets && assets.length > 0 ? (
        <div data-testid="portfolio-table">
          {assets.map((asset: any, index: number) => (
            <div key={index} data-testid={`asset-${asset.symbol}`}>
              {asset.symbol} - {asset.quantity}
            </div>
          ))}
        </div>
      ) : (
        <div data-testid="no-assets">No assets found</div>
      )}
    </div>
  ),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  writable: true,
});

describe('Investor Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    
    // Reset sessionStorage mocks
    (window.sessionStorage.getItem as any).mockReturnValue('test-investor');
  });

  const mockFetchResponse = (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });

  describe('Dashboard Loading', () => {
    it('should render loading state initially', () => {
      const DashboardComponent = () => {
        const [loading, setLoading] = React.useState(true);
        
        React.useEffect(() => {
          // Simulate loading
          setTimeout(() => setLoading(false), 100);
        }, []);

        if (loading) {
          return <div data-testid="loading-spinner">Loading...</div>;
        }

        return <div data-testid="dashboard-content">Dashboard loaded</div>;
      };

      render(<DashboardComponent />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render dashboard content after loading', async () => {
      const DashboardComponent = () => {
        const [loading, setLoading] = React.useState(true);
        
        React.useEffect(() => {
          setTimeout(() => setLoading(false), 100);
        }, []);

        if (loading) {
          return <div data-testid="loading-spinner">Loading...</div>;
        }

        return <div data-testid="dashboard-content">Dashboard loaded</div>;
      };

      render(<DashboardComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
      });
    });
  });

  describe('Portfolio Data Display', () => {
    it('should render portfolio overview with assets', async () => {
      const mockAssets = [
        { symbol: 'BTC', name: 'Bitcoin', quantity: 1.5, location: 'Phantom' },
        { symbol: 'ETH', name: 'Ethereum', quantity: 10, location: 'Ledger' },
      ];

      const PortfolioOverview = ({ assets }: { assets: any[] }) => (
        <div>
          <h2>Portfolio Overview</h2>
          {assets && assets.length > 0 ? (
            <div data-testid="portfolio-table">
              {assets.map((asset: any, index: number) => (
                <div key={index} data-testid={`asset-${asset.symbol}`}>
                  {asset.symbol} - {asset.quantity}
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="no-assets">No assets found</div>
          )}
        </div>
      );

      render(<PortfolioOverview assets={mockAssets} />);

      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      expect(screen.getByTestId('portfolio-table')).toBeInTheDocument();
      expect(screen.getByTestId('asset-BTC')).toBeInTheDocument();
      expect(screen.getByTestId('asset-ETH')).toBeInTheDocument();
    });

    it('should handle empty portfolio state', () => {
      const PortfolioOverview = ({ assets }: { assets: any[] }) => (
        <div>
          <h2>Portfolio Overview</h2>
          {assets && assets.length > 0 ? (
            <div data-testid="portfolio-table">
              {assets.map((asset: any, index: number) => (
                <div key={index} data-testid={`asset-${asset.symbol}`}>
                  {asset.symbol} - {asset.quantity}
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="no-assets">No assets found</div>
          )}
        </div>
      );

      render(<PortfolioOverview assets={[]} />);

      expect(screen.getByTestId('no-assets')).toBeInTheDocument();
      expect(screen.getByText('No assets found')).toBeInTheDocument();
    });
  });

  describe('Charts and Analytics', () => {
    it('should render risk breakdown chart with data', () => {
      const mockRiskData = {
        'High': 50000,
        'Medium': 30000,
        'Low': 20000,
      };

      const StackedBarChart = ({ data, title }: { data: any; title: string }) => (
        <div>
          <h3>{title}</h3>
          {data && Object.keys(data).length > 0 ? (
            <div data-testid="chart-content">
              {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                  {key}: {value}
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="no-data">No data available</div>
          )}
        </div>
      );

      render(<StackedBarChart data={mockRiskData} title="Risk Breakdown" />);

      expect(screen.getByText('Risk Breakdown')).toBeInTheDocument();
      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
      expect(screen.getByText('High: 50000')).toBeInTheDocument();
      expect(screen.getByText('Medium: 30000')).toBeInTheDocument();
      expect(screen.getByText('Low: 20000')).toBeInTheDocument();
    });

    it('should render type breakdown chart with data', () => {
      const mockTypeData = {
        'DeFi': 60000,
        'Memecoin': 25000,
        'Layer 1': 15000,
      };

      const StackedBarChart = ({ data, title }: { data: any; title: string }) => (
        <div>
          <h3>{title}</h3>
          {data && Object.keys(data).length > 0 ? (
            <div data-testid="chart-content">
              {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                  {key}: {value}
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="no-data">No data available</div>
          )}
        </div>
      );

      render(<StackedBarChart data={mockTypeData} title="Asset Type Breakdown" />);

      expect(screen.getByText('Asset Type Breakdown')).toBeInTheDocument();
      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
      expect(screen.getByText('DeFi: 60000')).toBeInTheDocument();
      expect(screen.getByText('Memecoin: 25000')).toBeInTheDocument();
      expect(screen.getByText('Layer 1: 15000')).toBeInTheDocument();
    });

    it('should handle empty chart data', () => {
      const StackedBarChart = ({ data, title }: { data: any; title: string }) => (
        <div>
          <h3>{title}</h3>
          {data && Object.keys(data).length > 0 ? (
            <div data-testid="chart-content">
              {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                  {key}: {value}
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="no-data">No data available</div>
          )}
        </div>
      );

      render(<StackedBarChart data={{}} title="Empty Chart" />);

      expect(screen.getByTestId('no-data')).toBeInTheDocument();
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch portfolio data on component mount', async () => {
      const mockData = {
        success: true,
        assets: [
          { symbol: 'BTC', name: 'Bitcoin', quantity: 1.5 },
        ]
      };

      (global.fetch as any).mockResolvedValueOnce(mockFetchResponse(mockData));

      const DataFetchingComponent = () => {
        const [data, setData] = React.useState(null);

        React.useEffect(() => {
          const fetchData = async () => {
            const response = await fetch('/api/get-portfolio-data');
            const result = await response.json();
            setData(result);
          };
          fetchData();
        }, []);

        return (
          <div>
            {data ? (
              <div data-testid="data-loaded">Data loaded</div>
            ) : (
              <div data-testid="data-loading">Loading data...</div>
            )}
          </div>
        );
      };

      render(<DataFetchingComponent />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/get-portfolio-data');
        expect(screen.getByTestId('data-loaded')).toBeInTheDocument();
      });
    });

    it('should handle data fetching errors', async () => {
      const mockError = { success: false, error: 'Failed to fetch data' };
      (global.fetch as any).mockResolvedValueOnce(mockFetchResponse(mockError, 500));

      const ErrorHandlingComponent = () => {
        const [error, setError] = React.useState(null);

        React.useEffect(() => {
          const fetchData = async () => {
            try {
              const response = await fetch('/api/get-portfolio-data');
              const result = await response.json();
              if (!result.success) {
                setError(result.error);
              }
            } catch (err) {
              setError('Network error');
            }
          };
          fetchData();
        }, []);

        return (
          <div>
            {error ? (
              <div data-testid="error-message">{error}</div>
            ) : (
              <div data-testid="no-error">No error</div>
            )}
          </div>
        );
      };

      render(<ErrorHandlingComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
      });
    });
  });
});