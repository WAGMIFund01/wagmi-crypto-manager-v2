import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../get-portfolio-data/route'
import { sheetsAdapter } from '@/lib/sheetsAdapter'

// Mock the sheetsAdapter instance
vi.mock('@/lib/sheetsAdapter', () => ({
  sheetsAdapter: {
    getPortfolioData: vi.fn()
  }
}))

describe('/api/get-portfolio-data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return portfolio data successfully', async () => {
    const mockData = {
      success: true,
      data: [
        {
          assetName: 'Bitcoin',
          symbol: 'BTC',
          chain: 'Bitcoin',
          riskLevel: 'Low',
          location: 'Cold Storage',
          coinType: 'Major',
          quantity: 0.5,
          currentPrice: 45000,
          totalValue: 22500,
          lastPriceUpdate: '2024-01-15',
          priceChange24h: 2.5,
          coinGeckoId: 'bitcoin',
          thesis: 'Long-term store of value'
        }
      ]
    }

    vi.mocked(sheetsAdapter.getPortfolioData).mockResolvedValue(mockData)

    const response = await GET()
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({
      success: true,
      assets: mockData
    })
    expect(sheetsAdapter.getPortfolioData).toHaveBeenCalledOnce()
  })

  it('should handle errors gracefully', async () => {
    const mockError = {
      success: false,
      data: [],
      error: 'Failed to fetch portfolio data'
    }

    vi.mocked(sheetsAdapter.getPortfolioData).mockResolvedValue(mockError)

    const response = await GET()
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({
      success: true,
      assets: mockError
    })
  })

  it('should handle exceptions', async () => {
    vi.mocked(sheetsAdapter.getPortfolioData).mockRejectedValue(new Error('Sheets API error'))

    const response = await GET()
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result).toEqual({
      success: false,
      error: 'Internal server error during portfolio data fetch',
      errorCode: 'INTERNAL_SERVER_ERROR'
    })
  })
})
