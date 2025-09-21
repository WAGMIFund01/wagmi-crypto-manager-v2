import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SheetsAdapter } from '../sheetsAdapter'
import { setupSheetsMocks, setupSheetsErrorMocks, mockGoogleSheets, mockGoogleAuth } from '../../test/mocks/googleSheets'

// Mock the googleapis module
vi.mock('googleapis', () => ({
  google: {
    sheets: vi.fn(() => mockGoogleSheets),
    auth: mockGoogleAuth
  }
}))

// Mock the config module
vi.mock('../config', () => ({
  config: {
    googleSheetsEndpoint: 'https://sheets.googleapis.com/v4/spreadsheets'
  }
}))

describe('SheetsAdapter', () => {
  let sheetsAdapter: SheetsAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    setupSheetsMocks()
    sheetsAdapter = new SheetsAdapter()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getInvestorData', () => {
    it('should fetch and parse investor data correctly', async () => {
      const result = await sheetsAdapter.getInvestorData()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
        investor_id: 'INV001',
        name: 'John Doe',
        email: 'john@example.com',
        join_date: '2024-01-15',
        investment_value: 10000,
        current_value: 12000,
        share_percentage: 25.5,
        return_percentage: 20.0
      })
    })

    it('should handle API errors gracefully', async () => {
      setupSheetsErrorMocks()
      
      const result = await sheetsAdapter.getInvestorData()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.data).toEqual([])
    })

    it('should handle empty data', async () => {
      mockGoogleSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] }
      })

      const result = await sheetsAdapter.getInvestorData()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })
  })

  describe('getPortfolioData', () => {
    it('should fetch and parse portfolio data correctly', async () => {
      const result = await sheetsAdapter.getPortfolioData()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
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
      })
    })

    it('should handle missing optional fields', async () => {
      const dataWithMissingFields = [
        ['Asset Name', 'Symbol', 'Chain', 'Risk Level', 'Location', 'Coin Type', 'Quantity', 'Current Price', 'Total Value', 'Last Price Update', 'Price Change 24h', 'CoinGecko ID', 'Thesis'],
        ['Bitcoin', 'BTC', 'Bitcoin', 'Low', 'Cold Storage', 'Major', '0.5', '45000', '22500', '2024-01-15', '', '', ''],
      ]

      mockGoogleSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: dataWithMissingFields }
      })

      const result = await sheetsAdapter.getPortfolioData()

      expect(result.success).toBe(true)
      expect(result.data[0].priceChange24h).toBeUndefined()
      expect(result.data[0].coinGeckoId).toBe('')
      expect(result.data[0].thesis).toBe('')
    })
  })

  describe('getKpiData', () => {
    it('should fetch and parse KPI data correctly', async () => {
      const result = await sheetsAdapter.getKpiData()

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        activeInvestors: '2',
        totalAUM: '50000',
        cumulativeReturn: '20.0',
        monthOnMonth: '5.2'
      })
    })

    it('should handle missing KPI data', async () => {
      mockGoogleSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] }
      })

      const result = await sheetsAdapter.getKpiData()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('addPortfolioAsset', () => {
    it('should add a new portfolio asset', async () => {
      const newAsset = {
        assetName: 'Solana',
        symbol: 'SOL',
        chain: 'Solana',
        riskLevel: 'Medium',
        location: 'Hot Wallet',
        coinType: 'Altcoin',
        quantity: 100,
        currentPrice: 100,
        thesis: 'High-performance blockchain'
      }

      const result = await sheetsAdapter.addPortfolioAsset(newAsset)

      expect(result.success).toBe(true)
      expect(mockGoogleSheets.spreadsheets.values.update).toHaveBeenCalled()
    })

    it('should handle add asset errors', async () => {
      setupSheetsErrorMocks()

      const newAsset = {
        assetName: 'Solana',
        symbol: 'SOL',
        chain: 'Solana',
        riskLevel: 'Medium',
        location: 'Hot Wallet',
        coinType: 'Altcoin',
        quantity: 100,
        currentPrice: 100,
        thesis: 'High-performance blockchain'
      }

      const result = await sheetsAdapter.addPortfolioAsset(newAsset)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('editPortfolioAsset', () => {
    it('should edit an existing portfolio asset', async () => {
      const updatedAsset = {
        assetName: 'Bitcoin',
        symbol: 'BTC',
        chain: 'Bitcoin',
        riskLevel: 'Low',
        location: 'Cold Storage',
        coinType: 'Major',
        quantity: 1.0,
        currentPrice: 50000,
        thesis: 'Updated thesis'
      }

      const result = await sheetsAdapter.editPortfolioAsset(1, updatedAsset)

      expect(result.success).toBe(true)
      expect(mockGoogleSheets.spreadsheets.values.update).toHaveBeenCalled()
    })

    it('should handle edit asset errors', async () => {
      setupSheetsErrorMocks()

      const updatedAsset = {
        assetName: 'Bitcoin',
        symbol: 'BTC',
        chain: 'Bitcoin',
        riskLevel: 'Low',
        location: 'Cold Storage',
        coinType: 'Major',
        quantity: 1.0,
        currentPrice: 50000,
        thesis: 'Updated thesis'
      }

      const result = await sheetsAdapter.editPortfolioAsset(1, updatedAsset)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('removePortfolioAsset', () => {
    it('should remove a portfolio asset', async () => {
      const result = await sheetsAdapter.removePortfolioAsset(1)

      expect(result.success).toBe(true)
      expect(mockGoogleSheets.spreadsheets.values.update).toHaveBeenCalled()
    })

    it('should handle remove asset errors', async () => {
      setupSheetsErrorMocks()

      const result = await sheetsAdapter.removePortfolioAsset(1)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('updateAssetPrices', () => {
    it('should update asset prices', async () => {
      const priceUpdates = [
        { row: 2, price: 46000, change24h: 3.0 },
        { row: 3, price: 3100, change24h: 2.0 }
      ]

      const result = await sheetsAdapter.updateAssetPrices(priceUpdates)

      expect(result.success).toBe(true)
      expect(mockGoogleSheets.spreadsheets.values.batchUpdate).toHaveBeenCalled()
    })

    it('should handle price update errors', async () => {
      setupSheetsErrorMocks()

      const priceUpdates = [
        { row: 2, price: 46000, change24h: 3.0 }
      ]

      const result = await sheetsAdapter.updateAssetPrices(priceUpdates)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
