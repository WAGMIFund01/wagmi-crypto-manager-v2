import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPersonalPortfolioKPIData } from '../personal-portfolio-kpi-data';
import { sheetsAdapter } from '../sheetsAdapter';

// Mock the sheetsAdapter
vi.mock('../sheetsAdapter', () => ({
  sheetsAdapter: {
    getPersonalPortfolioKpiFromKpisTab: vi.fn()
  }
}));

describe('Personal Portfolio KPI Data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch Personal Portfolio KPI data with MoM and Cumulative returns', async () => {
    // Mock the sheetsAdapter response
    const mockKpiData = {
      totalAUM: 61117.54,
      monthlyReturn: 70.04,
      cumulativeReturn: 226.88,
      lastUpdated: '2024-12-19T10:00:00Z'
    };

    vi.mocked(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab).mockResolvedValue(mockKpiData);

    const result = await fetchPersonalPortfolioKPIData();

    expect(result).toEqual(mockKpiData);
    expect(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab).toHaveBeenCalledTimes(1);
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab).mockRejectedValue(new Error('API Error'));

    const result = await fetchPersonalPortfolioKPIData();

    expect(result).toBeNull();
  });

  it('should return data with correct structure for UniversalNavbar', async () => {
    const mockKpiData = {
      totalAUM: 61117.54,
      monthlyReturn: 70.04,
      cumulativeReturn: 226.88,
      lastUpdated: '2024-12-19T10:00:00Z'
    };

    vi.mocked(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab).mockResolvedValue(mockKpiData);

    const result = await fetchPersonalPortfolioKPIData();

    expect(result).toHaveProperty('totalAUM');
    expect(result).toHaveProperty('monthlyReturn');
    expect(result).toHaveProperty('cumulativeReturn');
    expect(result).toHaveProperty('lastUpdated');
    expect(typeof result?.totalAUM).toBe('number');
    expect(typeof result?.monthlyReturn).toBe('number');
    expect(typeof result?.cumulativeReturn).toBe('number');
    expect(typeof result?.lastUpdated).toBe('string');
  });
});
