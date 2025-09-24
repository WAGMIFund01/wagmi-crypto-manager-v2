import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../get-performance-data/route';

// Mock global fetch
global.fetch = vi.fn();

// Mock the API middleware
vi.mock('@/lib/apiMiddleware', () => ({
  withApiMiddleware: vi.fn((handler) => handler)
}));

// Mock the Google Sheets API
vi.mock('@/lib/sheetsAdapter', () => ({
  getSheetsAdapter: vi.fn(() => ({
    readSheetData: vi.fn()
  }))
}));

// Mock logger and errorMonitor
vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn()
  },
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@/lib/errorMonitor', () => ({
  default: {
    recordError: vi.fn()
  },
  errorMonitor: {
    recordError: vi.fn()
  },
  recordError: vi.fn(),
  recordRequest: vi.fn()
}));

describe('/api/get-performance-data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns performance data successfully', async () => {
    // Mock the Google Sheets API response with correct column structure
    const mockGoogleSheetsResponse = `google.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"1234567890","table":{"cols":[{"id":"A","label":"A","type":"string"},{"id":"B","label":"Date","type":"string"},{"id":"C","label":"C","type":"string"},{"id":"D","label":"D","type":"string"},{"id":"E","label":"E","type":"string"},{"id":"F","label":"F","type":"string"},{"id":"G","label":"Ending AUM","type":"number"},{"id":"H","label":"MoM Return","type":"number"},{"id":"I","label":"Cumulative Return","type":"number"},{"id":"J","label":"J","type":"string"},{"id":"K","label":"K","type":"string"},{"id":"L","label":"MoM return (Total)","type":"number"},{"id":"M","label":"Cumulative Return (Total)","type":"number"},{"id":"N","label":"N","type":"string"},{"id":"O","label":"O","type":"string"},{"id":"P","label":"MoM return (Total 3)","type":"number"},{"id":"Q","label":"Cumulative Return (Total 3)","type":"number"}],"rows":[{"c":[{"v":"","f":""},{"v":"","f":"Jan-2024"},{"v":""},{"v":""},{"v":""},{"v":""},{"v":1000000},{"v":0.05},{"v":0.05},{"v":""},{"v":""},{"v":0.03},{"v":0.03},{"v":""},{"v":""},{"v":0.04},{"v":0.04}]},{"c":[{"v":"","f":""},{"v":"","f":"Feb-2024"},{"v":""},{"v":""},{"v":""},{"v":""},{"v":1050000},{"v":0.05},{"v":0.10},{"v":""},{"v":""},{"v":0.03},{"v":0.06},{"v":""},{"v":""},{"v":0.04},{"v":0.08}]}]}});`;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue(mockGoogleSheetsResponse)
    } as any);

    const request = new Request('http://localhost:3000/api/get-performance-data');
    const response = await GET(request);
    const data = await response.json();


    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0]).toEqual({
      month: 'Jan-2024',
      endingAUM: 1000000,
      wagmiMoM: 5, // Converted to percentage
      wagmiCumulative: 5,
      totalMoM: 3,
      totalCumulative: 3,
      total3MoM: 4,
      total3Cumulative: 4
    });
  });

  it('filters out future months', async () => {
    // Mock the Google Sheets API response with future month
    const mockGoogleSheetsResponse = `google.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"1234567890","table":{"cols":[{"id":"A","label":"A","type":"string"},{"id":"B","label":"Date","type":"string"},{"id":"C","label":"C","type":"string"},{"id":"D","label":"D","type":"string"},{"id":"E","label":"E","type":"string"},{"id":"F","label":"F","type":"string"},{"id":"G","label":"Ending AUM","type":"number"},{"id":"H","label":"MoM Return","type":"number"},{"id":"I","label":"Cumulative Return","type":"number"},{"id":"J","label":"J","type":"string"},{"id":"K","label":"K","type":"string"},{"id":"L","label":"MoM return (Total)","type":"number"},{"id":"M","label":"Cumulative Return (Total)","type":"number"},{"id":"N","label":"N","type":"string"},{"id":"O","label":"O","type":"string"},{"id":"P","label":"MoM return (Total 3)","type":"number"},{"id":"Q","label":"Cumulative Return (Total 3)","type":"number"}],"rows":[{"c":[{"v":"","f":""},{"v":"","f":"Jan-2024"},{"v":""},{"v":""},{"v":""},{"v":""},{"v":1000000},{"v":0.05},{"v":0.05},{"v":""},{"v":""},{"v":0.03},{"v":0.03},{"v":""},{"v":""},{"v":0.04},{"v":0.04}]},{"c":[{"v":"","f":""},{"v":"","f":"Dec-2025"},{"v":""},{"v":""},{"v":""},{"v":""},{"v":2000000},{"v":0.10},{"v":0.15},{"v":""},{"v":""},{"v":0.08},{"v":0.14},{"v":""},{"v":""},{"v":0.09},{"v":0.13}]}]}});`;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue(mockGoogleSheetsResponse)
    } as any);

    const request = new Request('http://localhost:3000/api/get-performance-data');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1); // Only current/historical month
    expect(data.data[0].month).toBe('Jan-2024');
  });

  it('handles empty data', async () => {
    // Mock the Google Sheets API response with no data rows
    const mockGoogleSheetsResponse = `google.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"1234567890","table":{"cols":[{"id":"A","label":"A","type":"string"},{"id":"B","label":"Date","type":"string"},{"id":"C","label":"C","type":"string"},{"id":"D","label":"D","type":"string"},{"id":"E","label":"E","type":"string"},{"id":"F","label":"F","type":"string"},{"id":"G","label":"Ending AUM","type":"number"},{"id":"H","label":"MoM Return","type":"number"},{"id":"I","label":"Cumulative Return","type":"number"},{"id":"J","label":"J","type":"string"},{"id":"K","label":"K","type":"string"},{"id":"L","label":"MoM return (Total)","type":"number"},{"id":"M","label":"Cumulative Return (Total)","type":"number"},{"id":"N","label":"N","type":"string"},{"id":"O","label":"O","type":"string"},{"id":"P","label":"MoM return (Total 3)","type":"number"},{"id":"Q","label":"Cumulative Return (Total 3)","type":"number"}],"rows":[]}});`;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue(mockGoogleSheetsResponse)
    } as any);

    const request = new Request('http://localhost:3000/api/get-performance-data');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('handles Google Sheets API errors', async () => {
    // Mock fetch to return an error
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as any);

    const request = new Request('http://localhost:3000/api/get-performance-data');
    const response = await GET(request);

    expect(response.status).toBe(500);
    
    const { default: errorMonitor } = await import('@/lib/errorMonitor');
    expect(errorMonitor.recordError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('handles malformed data gracefully', async () => {
    // Mock the Google Sheets API response with invalid AUM value
    const mockGoogleSheetsResponse = `google.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"1234567890","table":{"cols":[{"id":"A","label":"A","type":"string"},{"id":"B","label":"Date","type":"string"},{"id":"C","label":"C","type":"string"},{"id":"D","label":"D","type":"string"},{"id":"E","label":"E","type":"string"},{"id":"F","label":"F","type":"string"},{"id":"G","label":"Ending AUM","type":"number"},{"id":"H","label":"MoM Return","type":"number"},{"id":"I","label":"Cumulative Return","type":"number"},{"id":"J","label":"J","type":"string"},{"id":"K","label":"K","type":"string"},{"id":"L","label":"MoM return (Total)","type":"number"},{"id":"M","label":"Cumulative Return (Total)","type":"number"},{"id":"N","label":"N","type":"string"},{"id":"O","label":"O","type":"string"},{"id":"P","label":"MoM return (Total 3)","type":"number"},{"id":"Q","label":"Cumulative Return (Total 3)","type":"number"}],"rows":[{"c":[{"v":"","f":""},{"v":"","f":"Jan-2024"},{"v":""},{"v":""},{"v":""},{"v":""},{"v":"invalid"},{"v":0.05},{"v":0.05},{"v":""},{"v":""},{"v":0.03},{"v":0.03},{"v":""},{"v":""},{"v":0.04},{"v":0.04}]}]}});`;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue(mockGoogleSheetsResponse)
    } as any);

    const request = new Request('http://localhost:3000/api/get-performance-data');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].endingAUM).toBe(0); // Should default to 0 for invalid values
  });

  it('converts decimal percentages to percentages correctly', async () => {
    // Mock the Google Sheets API response with decimal values
    const mockGoogleSheetsResponse = `google.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"1234567890","table":{"cols":[{"id":"A","label":"A","type":"string"},{"id":"B","label":"Date","type":"string"},{"id":"C","label":"C","type":"string"},{"id":"D","label":"D","type":"string"},{"id":"E","label":"E","type":"string"},{"id":"F","label":"F","type":"string"},{"id":"G","label":"Ending AUM","type":"number"},{"id":"H","label":"MoM Return","type":"number"},{"id":"I","label":"Cumulative Return","type":"number"},{"id":"J","label":"J","type":"string"},{"id":"K","label":"K","type":"string"},{"id":"L","label":"MoM return (Total)","type":"number"},{"id":"M","label":"Cumulative Return (Total)","type":"number"},{"id":"N","label":"N","type":"string"},{"id":"O","label":"O","type":"string"},{"id":"P","label":"MoM return (Total 3)","type":"number"},{"id":"Q","label":"Cumulative Return (Total 3)","type":"number"}],"rows":[{"c":[{"v":"","f":""},{"v":"","f":"Jan-2024"},{"v":""},{"v":""},{"v":""},{"v":""},{"v":1000000},{"v":0.05},{"v":0.05},{"v":""},{"v":""},{"v":0.03},{"v":0.03},{"v":""},{"v":""},{"v":0.04},{"v":0.04}]}]}});`;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue(mockGoogleSheetsResponse)
    } as any);

    const request = new Request('http://localhost:3000/api/get-performance-data');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data[0].wagmiMoM).toBe(5); // 0.05 * 100 = 5
    expect(data.data[0].wagmiCumulative).toBe(5);
    expect(data.data[0].totalMoM).toBe(3);
    expect(data.data[0].totalCumulative).toBe(3);
    expect(data.data[0].total3MoM).toBe(4);
    expect(data.data[0].total3Cumulative).toBe(4);
  });
});
