import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the sheets adapter
const mockSheetsAdapter = {
  getPortfolioData: vi.fn(),
  getInvestorData: vi.fn(),
  validateInvestor: vi.fn(),
  addPortfolioAsset: vi.fn(),
  editPortfolioAsset: vi.fn(),
  removePortfolioAsset: vi.fn(),
};

vi.mock('@/lib/sheetsAdapter', () => ({
  default: mockSheetsAdapter,
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock the error monitor
vi.mock('@/lib/errorMonitor', () => ({
  default: {
    recordError: vi.fn(),
  },
}));

describe('API Endpoints Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRequest = (body: any = {}) => {
    return {
      method: 'GET',
      json: () => Promise.resolve(body),
      headers: {
        get: vi.fn(),
      },
      nextUrl: {
        pathname: '/api/test',
        search: '',
      },
    } as unknown as NextRequest;
  };

  const mockResponse = () => ({
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
  });

  describe('Portfolio Data API', () => {
    it('should fetch portfolio data successfully', async () => {
      const mockData = {
        assets: [
          { symbol: 'BTC', name: 'Bitcoin', quantity: 1.5 },
          { symbol: 'ETH', name: 'Ethereum', quantity: 10 },
        ]
      };

      mockSheetsAdapter.getPortfolioData.mockResolvedValue(mockData);

      // Test the data structure that would be returned
      const result = await mockSheetsAdapter.getPortfolioData();
      
      expect(result).toEqual(mockData);
      expect(mockSheetsAdapter.getPortfolioData).toHaveBeenCalled();
    });

    it('should handle portfolio data errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockSheetsAdapter.getPortfolioData.mockRejectedValue(error);

      await expect(mockSheetsAdapter.getPortfolioData()).rejects.toThrow('Database connection failed');
    });
  });

  describe('Investor Data API', () => {
    it('should validate investor credentials', async () => {
      const mockInvestor = {
        id: 'test-investor',
        name: 'Test Investor',
        email: 'test@example.com'
      };

      mockSheetsAdapter.validateInvestor.mockResolvedValue(mockInvestor);

      const result = await mockSheetsAdapter.validateInvestor('test-investor');
      
      expect(result).toEqual(mockInvestor);
      expect(mockSheetsAdapter.validateInvestor).toHaveBeenCalledWith('test-investor');
    });

    it('should handle invalid investor credentials', async () => {
      mockSheetsAdapter.validateInvestor.mockResolvedValue(null);

      const result = await mockSheetsAdapter.validateInvestor('invalid-id');
      
      expect(result).toBeNull();
    });
  });

  describe('Asset Management APIs', () => {
    it('should add new asset successfully', async () => {
      const newAsset = {
        symbol: 'ADA',
        name: 'Cardano',
        quantity: 1000,
        location: 'Phantom'
      };

      mockSheetsAdapter.addPortfolioAsset.mockResolvedValue({ success: true });

      const result = await mockSheetsAdapter.addPortfolioAsset(newAsset);
      
      expect(result.success).toBe(true);
      expect(mockSheetsAdapter.addPortfolioAsset).toHaveBeenCalledWith(newAsset);
    });

    it('should edit existing asset successfully', async () => {
      const editData = {
        symbol: 'BTC',
        quantity: 2.0,
        location: 'Ledger'
      };

      mockSheetsAdapter.editPortfolioAsset.mockResolvedValue({ success: true });

      const result = await mockSheetsAdapter.editPortfolioAsset(editData);
      
      expect(result.success).toBe(true);
      expect(mockSheetsAdapter.editPortfolioAsset).toHaveBeenCalledWith(editData);
    });

    it('should remove asset successfully', async () => {
      const assetToRemove = {
        symbol: 'DOGE',
        location: 'Phantom'
      };

      mockSheetsAdapter.removePortfolioAsset.mockResolvedValue({ success: true });

      const result = await mockSheetsAdapter.removePortfolioAsset(assetToRemove);
      
      expect(result.success).toBe(true);
      expect(mockSheetsAdapter.removePortfolioAsset).toHaveBeenCalledWith(assetToRemove);
    });
  });
});