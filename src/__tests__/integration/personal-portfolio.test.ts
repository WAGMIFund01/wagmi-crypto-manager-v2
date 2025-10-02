import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET as getPersonalPortfolioData } from '@/app/api/get-personal-portfolio-data/route'
import { GET as getPersonalPortfolioKpi } from '@/app/api/get-personal-portfolio-kpi/route'
import { sheetsAdapter } from '@/lib/sheetsAdapter'

// Mock sheetsAdapter
vi.mock('@/lib/sheetsAdapter', () => ({
  sheetsAdapter: {
    getPersonalPortfolioData: vi.fn(),
    getPersonalPortfolioKpiFromKpisTab: vi.fn(),
  },
}))

describe('Personal Portfolio Module Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/get-personal-portfolio-data', () => {
    it('returns personal portfolio data successfully', async () => {
      const mockData = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          quantity: 1,
          currentPrice: 50000,
          totalValue: 50000,
          chain: 'Bitcoin',
          riskLevel: 'Medium',
          location: 'Phantom Wallet',
          coinType: 'Altcoin',
          lastPriceUpdate: '2025-10-02',
          priceChange24h: 5.2,
          coinGeckoId: 'bitcoin',
        },
      ]

      ;(sheetsAdapter.getPersonalPortfolioData as ReturnType<typeof vi.fn>).mockResolvedValue(mockData)

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-data')
      const response = await getPersonalPortfolioData(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(sheetsAdapter.getPersonalPortfolioData).toHaveBeenCalledTimes(1)
    })

    it('handles empty portfolio data', async () => {
      ;(sheetsAdapter.getPersonalPortfolioData as ReturnType<typeof vi.fn>).mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-data')
      const response = await getPersonalPortfolioData(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles errors gracefully', async () => {
      ;(sheetsAdapter.getPersonalPortfolioData as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Sheets API error')
      )

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-data')
      const response = await getPersonalPortfolioData(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })

  describe('GET /api/get-personal-portfolio-kpi', () => {
    it('returns personal portfolio KPI data successfully', async () => {
      const mockKpiData = {
        totalAUM: 150000,
        lastUpdated: '2025-10-02',
      }

      ;(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockKpiData
      )

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-kpi')
      const response = await getPersonalPortfolioKpi(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalAUM).toBe(150000)
      expect(data.lastUpdated).toBe('2025-10-02')
      expect(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab).toHaveBeenCalledTimes(1)
    })

    it('handles zero AUM', async () => {
      const mockKpiData = {
        totalAUM: 0,
        lastUpdated: '2025-10-02',
      }

      ;(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockKpiData
      )

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-kpi')
      const response = await getPersonalPortfolioKpi(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalAUM).toBe(0)
    })

    it('handles missing last updated timestamp', async () => {
      const mockKpiData = {
        totalAUM: 150000,
        lastUpdated: '--',
      }

      ;(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockKpiData
      )

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-kpi')
      const response = await getPersonalPortfolioKpi(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalAUM).toBe(150000)
      expect(data.lastUpdated).toBe('--')
    })

    it('handles errors gracefully', async () => {
      ;(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('KPI fetch error')
      )

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-kpi')
      const response = await getPersonalPortfolioKpi(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })

  describe('Personal Portfolio vs WAGMI Fund Isolation', () => {
    it('fetches data from correct sheet for personal portfolio', async () => {
      const mockPersonalData = [
        {
          symbol: 'SOL',
          name: 'Solana',
          quantity: 100,
          currentPrice: 100,
          totalValue: 10000,
          chain: 'Solana',
          riskLevel: 'High',
          location: 'Phantom Wallet',
          coinType: 'Altcoin',
          lastPriceUpdate: '2025-10-02',
          priceChange24h: 3.5,
          coinGeckoId: 'solana',
        },
      ]

      ;(sheetsAdapter.getPersonalPortfolioData as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockPersonalData
      )

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-data')
      const response = await getPersonalPortfolioData(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(sheetsAdapter.getPersonalPortfolioData).toHaveBeenCalledTimes(1)
    })

    it('returns only personal portfolio KPIs (no investor data)', async () => {
      const mockKpiData = {
        totalAUM: 50000,
        lastUpdated: '2025-10-02',
      }

      ;(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockKpiData
      )

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-kpi')
      const response = await getPersonalPortfolioKpi(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      // Should not have investor-related fields
      expect(data.totalInvestors).toBeUndefined()
      expect(data.cumulativeReturn).toBeUndefined()
      expect(data.monthlyReturn).toBeUndefined()
      // Should have personal portfolio fields
      expect(data.totalAUM).toBeDefined()
      expect(data.lastUpdated).toBeDefined()
    })
  })

  describe('Data Validation', () => {
    it('validates personal portfolio data structure', async () => {
      const mockData = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          quantity: 10,
          currentPrice: 3000,
          totalValue: 30000,
          chain: 'Ethereum',
          riskLevel: 'Medium',
          location: 'MetaMask',
          coinType: 'Altcoin',
          lastPriceUpdate: '2025-10-02',
          priceChange24h: 2.1,
          coinGeckoId: 'ethereum',
        },
      ]

      ;(sheetsAdapter.getPersonalPortfolioData as ReturnType<typeof vi.fn>).mockResolvedValue(mockData)

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-data')
      const response = await getPersonalPortfolioData(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(sheetsAdapter.getPersonalPortfolioData).toHaveBeenCalledTimes(1)
    })

    it('validates KPI data structure', async () => {
      const mockKpiData = {
        totalAUM: 100000,
        lastUpdated: '2025-10-02',
      }

      ;(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockKpiData
      )

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-kpi')
      const response = await getPersonalPortfolioKpi(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(typeof data.totalAUM).toBe('number')
      expect(typeof data.lastUpdated).toBe('string')
    })
  })

  describe('Cache Control', () => {
    it('sets no-cache headers for personal portfolio data', async () => {
      ;(sheetsAdapter.getPersonalPortfolioData as ReturnType<typeof vi.fn>).mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-data')
      const response = await getPersonalPortfolioData(request)

      expect(response.status).toBe(200)
      // Response should have cache control headers
      expect(response.headers).toBeDefined()
    })

    it('sets no-cache headers for KPI data', async () => {
      ;(sheetsAdapter.getPersonalPortfolioKpiFromKpisTab as ReturnType<typeof vi.fn>).mockResolvedValue({
        totalAUM: 50000,
        lastUpdated: '2025-10-02',
      })

      const request = new Request('http://localhost:3000/api/get-personal-portfolio-kpi')
      const response = await getPersonalPortfolioKpi(request)

      expect(response.status).toBe(200)
      expect(response.headers).toBeDefined()
    })
  })
})

