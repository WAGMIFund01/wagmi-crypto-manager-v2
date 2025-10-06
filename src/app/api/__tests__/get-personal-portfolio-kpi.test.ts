import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../get-personal-portfolio-kpi/route';
import { SheetsAdapter } from '@/lib/sheetsAdapter';
import { NextRequest } from 'next/server';

// Mock SheetsAdapter
vi.mock('@/lib/sheetsAdapter');
const MockedSheetsAdapter = vi.mocked(SheetsAdapter);

describe('/api/get-personal-portfolio-kpi', () => {
  let mockSheetsAdapter: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSheetsAdapter = {
      getPersonalPortfolioKpiFromKpisTab: vi.fn(),
    };
    MockedSheetsAdapter.mockImplementation(() => mockSheetsAdapter);
  });

  describe('Successful KPI Data Retrieval', () => {
    it('returns personal portfolio KPI data successfully', async () => {
      const mockKpiData = {
        totalAUM: 60731.15,
        monthlyReturn: 69.0,
        cumulativeReturn: 598.3,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        ...mockKpiData
      });
      expect(mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab).toHaveBeenCalledTimes(1);
    });

    it('handles zero values correctly', async () => {
      const mockKpiData = {
        totalAUM: 0,
        monthlyReturn: 0,
        cumulativeReturn: 0,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalAUM).toBe(0);
      expect(data.monthlyReturn).toBe(0);
      expect(data.cumulativeReturn).toBe(0);
    });

    it('handles negative values correctly', async () => {
      const mockKpiData = {
        totalAUM: 50000,
        monthlyReturn: -5.2,
        cumulativeReturn: -10.5,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.monthlyReturn).toBe(-5.2);
      expect(data.cumulativeReturn).toBe(-10.5);
    });
  });

  describe('Error Handling', () => {
    it('handles SheetsAdapter errors gracefully', async () => {
      const errorMessage = 'Failed to fetch KPI data';
      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockRejectedValue(new Error(errorMessage));

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: errorMessage
      });
    });

    it('handles network timeout errors', async () => {
      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockRejectedValue(new Error('Request timeout'));

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Request timeout');
    });

    it('handles invalid data format errors', async () => {
      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue({
        // Missing required fields
        lastUpdated: '10/06/2025, 12:00:00'
      });

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid KPI data');
    });

    it('handles null/undefined data', async () => {
      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('No KPI data available');
    });
  });

  describe('Data Validation', () => {
    it('validates required fields are present', async () => {
      const mockKpiData = {
        totalAUM: 60731.15,
        monthlyReturn: 69.0,
        cumulativeReturn: 598.3,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalAUM).toBeDefined();
      expect(data.monthlyReturn).toBeDefined();
      expect(data.cumulativeReturn).toBeDefined();
      expect(data.lastUpdated).toBeDefined();
    });

    it('validates data types are correct', async () => {
      const mockKpiData = {
        totalAUM: 60731.15,
        monthlyReturn: 69.0,
        cumulativeReturn: 598.3,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(typeof data.totalAUM).toBe('number');
      expect(typeof data.monthlyReturn).toBe('number');
      expect(typeof data.cumulativeReturn).toBe('number');
      expect(typeof data.lastUpdated).toBe('string');
    });

    it('handles string numbers correctly', async () => {
      const mockKpiData = {
        totalAUM: '60731.15',
        monthlyReturn: '69.0',
        cumulativeReturn: '598.3',
        lastUpdated: '10/06/2025, 12:00:00'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalAUM).toBe(60731.15);
      expect(data.monthlyReturn).toBe(69.0);
      expect(data.cumulativeReturn).toBe(598.3);
    });
  });

  describe('Performance', () => {
    it('responds within reasonable time', async () => {
      const mockKpiData = {
        totalAUM: 60731.15,
        monthlyReturn: 69.0,
        cumulativeReturn: 598.3,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const startTime = performance.now();
      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const endTime = performance.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('handles concurrent requests efficiently', async () => {
      const mockKpiData = {
        totalAUM: 60731.15,
        monthlyReturn: 69.0,
        cumulativeReturn: 598.3,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const requests = Array(5).fill(null).map(() => 
        GET(new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi'))
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      expect(mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab).toHaveBeenCalledTimes(5);
    });
  });

  describe('Edge Cases', () => {
    it('handles very large numbers', async () => {
      const mockKpiData = {
        totalAUM: 999999999.99,
        monthlyReturn: 999.99,
        cumulativeReturn: 9999.99,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalAUM).toBe(999999999.99);
      expect(data.monthlyReturn).toBe(999.99);
      expect(data.cumulativeReturn).toBe(9999.99);
    });

    it('handles very small numbers', async () => {
      const mockKpiData = {
        totalAUM: 0.01,
        monthlyReturn: 0.001,
        cumulativeReturn: 0.01,
        lastUpdated: '10/06/2025, 12:00:00'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalAUM).toBe(0.01);
      expect(data.monthlyReturn).toBe(0.001);
      expect(data.cumulativeReturn).toBe(0.01);
    });

    it('handles special characters in lastUpdated', async () => {
      const mockKpiData = {
        totalAUM: 60731.15,
        monthlyReturn: 69.0,
        cumulativeReturn: 598.3,
        lastUpdated: '10/06/2025, 12:00:00 PM'
      };

      mockSheetsAdapter.getPersonalPortfolioKpiFromKpisTab.mockResolvedValue(mockKpiData);

      const request = new NextRequest('http://localhost:3000/api/get-personal-portfolio-kpi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lastUpdated).toBe('10/06/2025, 12:00:00 PM');
    });
  });
});
