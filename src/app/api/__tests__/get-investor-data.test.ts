import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../get-investor-data/route'
import { sheetsAdapter } from '@/lib/sheetsAdapter'

// Mock the sheetsAdapter instance
vi.mock('@/lib/sheetsAdapter', () => ({
  sheetsAdapter: {
    getInvestorData: vi.fn()
  }
}))

describe('/api/get-investor-data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return investor data successfully', async () => {
    const mockData = {
      success: true,
      data: [
        {
          investor_id: 'INV001',
          name: 'John Doe',
          email: 'john@example.com',
          join_date: '2024-01-15',
          investment_value: 10000,
          current_value: 12000,
          share_percentage: 25.5,
          return_percentage: 20.0
        }
      ]
    }

    vi.mocked(sheetsAdapter.getInvestorData).mockResolvedValue(mockData)

    const response = await GET()
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({
      success: true,
      investors: mockData
    })
    expect(sheetsAdapter.getInvestorData).toHaveBeenCalledOnce()
  })

  it('should handle errors gracefully', async () => {
    const mockError = {
      success: false,
      data: [],
      error: 'Failed to fetch investor data'
    }

    vi.mocked(sheetsAdapter.getInvestorData).mockResolvedValue(mockError)

    const response = await GET()
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({
      success: true,
      investors: mockError
    })
  })

  it('should handle exceptions', async () => {
    vi.mocked(sheetsAdapter.getInvestorData).mockRejectedValue(new Error('Database connection failed'))

    const response = await GET()
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result).toEqual({
      success: false,
      error: 'Internal server error during investor data fetch',
      errorCode: 'INTERNAL_SERVER_ERROR'
    })
  })
})
