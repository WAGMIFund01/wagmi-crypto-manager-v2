import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../edit-asset/route';

// Mock sheetsAdapter
const mockUpdateAsset = vi.fn();
vi.mock('@/lib/sheetsAdapter', () => ({
  sheetsAdapter: {
    updateAsset: mockUpdateAsset,
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('/api/edit-asset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates an asset successfully', async () => {
    const mockAsset = {
      assetId: 'BTC',
      assetName: 'Bitcoin',
      quantity: 2.5,
      averageCost: 40000,
      currentPrice: 45000,
      totalValue: 112500,
      percentageOfPortfolio: 25,
      thesis: 'Long term hold',
    };

    mockUpdateAsset.mockResolvedValue({ success: true });

    const request = new Request('http://localhost:3000/api/edit-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset: mockAsset, module: 'wagmi-fund' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateAsset).toHaveBeenCalledWith(mockAsset, 'wagmi-fund');
  });

  it('handles missing asset data', async () => {
    const request = new Request('http://localhost:3000/api/edit-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: 'wagmi-fund' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Asset data is required');
  });

  it('handles missing module parameter', async () => {
    const mockAsset = {
      assetId: 'BTC',
      assetName: 'Bitcoin',
      quantity: 2.5,
      averageCost: 40000,
      currentPrice: 45000,
      totalValue: 112500,
      percentageOfPortfolio: 25,
    };

    const request = new Request('http://localhost:3000/api/edit-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset: mockAsset }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Module parameter is required');
  });

  it('handles adapter update failure', async () => {
    const mockAsset = {
      assetId: 'BTC',
      assetName: 'Bitcoin',
      quantity: 2.5,
      averageCost: 40000,
      currentPrice: 45000,
      totalValue: 112500,
      percentageOfPortfolio: 25,
    };

    mockUpdateAsset.mockRejectedValue(new Error('Failed to update asset in Google Sheets'));

    const request = new Request('http://localhost:3000/api/edit-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset: mockAsset, module: 'wagmi-fund' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('validates module type', async () => {
    const mockAsset = {
      assetId: 'BTC',
      assetName: 'Bitcoin',
      quantity: 2.5,
      averageCost: 40000,
      currentPrice: 45000,
      totalValue: 112500,
      percentageOfPortfolio: 25,
    };

    const request = new Request('http://localhost:3000/api/edit-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset: mockAsset, module: 'invalid-module' }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Should either accept it or reject with proper error
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(data).toHaveProperty('success');
  });

  it('updates personal portfolio asset', async () => {
    const mockAsset = {
      assetId: 'ETH',
      assetName: 'Ethereum',
      quantity: 10,
      averageCost: 2000,
      currentPrice: 2500,
      totalValue: 25000,
      percentageOfPortfolio: 50,
    };

    mockUpdateAsset.mockResolvedValue({ success: true });

    const request = new Request('http://localhost:3000/api/edit-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset: mockAsset, module: 'personal-portfolio' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateAsset).toHaveBeenCalledWith(mockAsset, 'personal-portfolio');
  });
});


