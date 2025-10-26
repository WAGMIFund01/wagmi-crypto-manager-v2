import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '../remove-asset/route';

// Mock sheetsAdapter
const mockDeleteAsset = vi.fn();
vi.mock('@/lib/sheetsAdapter', () => ({
  sheetsAdapter: {
    deleteAsset: mockDeleteAsset,
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('/api/remove-asset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes an asset successfully', async () => {
    mockDeleteAsset.mockResolvedValue({ success: true });

    const request = new Request('http://localhost:3000/api/remove-asset', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId: 'BTC', module: 'wagmi-fund' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteAsset).toHaveBeenCalledWith('BTC', 'wagmi-fund');
  });

  it('handles missing assetId', async () => {
    const request = new Request('http://localhost:3000/api/remove-asset', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: 'wagmi-fund' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('assetId');
  });

  it('handles missing module parameter', async () => {
    const request = new Request('http://localhost:3000/api/remove-asset', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId: 'BTC' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('module');
  });

  it('handles adapter deletion failure', async () => {
    mockDeleteAsset.mockRejectedValue(new Error('Failed to delete asset from Google Sheets'));

    const request = new Request('http://localhost:3000/api/remove-asset', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId: 'BTC', module: 'wagmi-fund' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('deletes personal portfolio asset', async () => {
    mockDeleteAsset.mockResolvedValue({ success: true });

    const request = new Request('http://localhost:3000/api/remove-asset', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId: 'ETH', module: 'personal-portfolio' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteAsset).toHaveBeenCalledWith('ETH', 'personal-portfolio');
  });

  it('handles asset not found', async () => {
    mockDeleteAsset.mockResolvedValue({ success: false, error: 'Asset not found' });

    const request = new Request('http://localhost:3000/api/remove-asset', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId: 'NONEXISTENT', module: 'wagmi-fund' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(data.success).toBe(false);
  });
});


