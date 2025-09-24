import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPerformanceData } from '../performanceDataService';

// Mock fetch globally
global.fetch = vi.fn();

describe('performanceDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches performance data successfully', async () => {
    const mockData = [
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

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: mockData
      })
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

    const result = await fetchPerformanceData();

    expect(fetch).toHaveBeenCalledWith('/api/get-performance-data');
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('month', '2024-01');
    expect(result[0]).toHaveProperty('endingAUM', 1000000);
    expect(result[0]).toHaveProperty('wagmiMoM', 5.2);
  });

  it('handles API errors gracefully', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        error: 'Server error'
      })
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

    // Should fallback to mock data when API returns error
    const result = await fetchPerformanceData();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('handles network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    // Should fallback to mock data when network fails
    const result = await fetchPerformanceData();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('handles empty response', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: []
      })
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

    const result = await fetchPerformanceData();

    expect(result).toEqual([]);
  });

  it('handles malformed JSON response', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

    // Should fallback to mock data when JSON parsing fails
    const result = await fetchPerformanceData();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
