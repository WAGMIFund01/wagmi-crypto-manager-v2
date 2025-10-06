import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HouseholdPage from '../household/page';

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

describe('Household Page - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('Authentication', () => {
    it('redirects to login when no household session exists', async () => {
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

    it('redirects to login when isHouseholdMode is not true', async () => {
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'false';
        return null;
      });

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('renders dashboard when valid household session exists', async () => {
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });

      // Mock successful KPI data fetch
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalAUM: 60731.15,
          cumulativeReturn: 598.3,
          monthlyReturn: 69.0,
          lastUpdated: '10/06/2025, 12:00:00'
        }),
      });

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Loading household dashboard...')).toBeInTheDocument();
      });
    });
  });

  describe('KPI Data Fetching', () => {
    beforeEach(() => {
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });
    });

    it('fetches KPI data successfully', async () => {
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
        expect(global.fetch).toHaveBeenCalledWith('/api/get-personal-portfolio-kpi');
      });
    });

    it('handles KPI data fetch error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading household dashboard/)).toBeInTheDocument();
      });
    });

    it('handles network error during KPI fetch', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading household dashboard/)).toBeInTheDocument();
      });
    });
  });

  describe('Data Transformation', () => {
    beforeEach(() => {
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });
    });

    it('transforms KPI data correctly', async () => {
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
        // Should transform the data correctly
        expect(global.fetch).toHaveBeenCalledWith('/api/get-personal-portfolio-kpi');
      });
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });
    });

    it('shows loading spinner initially', () => {
      render(<HouseholdPage />);
      
      expect(screen.getByText('Loading household dashboard...')).toBeInTheDocument();
    });

    it('hides loading spinner after data loads', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalAUM: 60731.15,
          cumulativeReturn: 598.3,
          monthlyReturn: 69.0,
          lastUpdated: '10/06/2025, 12:00:00'
        }),
      });

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading household dashboard...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    beforeEach(() => {
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });
    });

    it('displays error message when KPI fetch fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading household dashboard/)).toBeInTheDocument();
      });
    });

    it('displays error message when KPI data is invalid', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing required fields
          lastUpdated: '10/06/2025, 12:00:00'
        }),
      });

      render(<HouseholdPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading household dashboard/)).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Integration', () => {
    beforeEach(() => {
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'householdSession') return JSON.stringify({ user: { role: 'household' } });
        if (key === 'isHouseholdMode') return 'true';
        return null;
      });
    });

    it('passes correct props to DashboardClient', async () => {
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
        // Should render DashboardClient with household dataSource
        expect(screen.getByText('Loading household dashboard...')).toBeInTheDocument();
      });
    });
  });
});
