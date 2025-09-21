import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../add-asset/route'
import { SheetsAdapter } from '@/lib/sheetsAdapter'

// Mock the SheetsAdapter
vi.mock('@/lib/sheetsAdapter', () => ({
  SheetsAdapter: vi.fn().mockImplementation(() => ({
    addPortfolioAsset: vi.fn()
  }))
}))

describe('/api/add-asset', () => {
  let mockSheetsAdapter: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockSheetsAdapter = {
      addPortfolioAsset: vi.fn()
    }
    ;(SheetsAdapter as any).mockImplementation(() => mockSheetsAdapter)
  })

  it('should add asset successfully', async () => {
    const assetData = {
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

    const mockResponse = {
      success: true,
      data: { ...assetData, id: 1 }
    }

    mockSheetsAdapter.addPortfolioAsset.mockResolvedValue(mockResponse)

    const request = new Request('http://localhost:3000/api/add-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual(mockResponse)
    expect(mockSheetsAdapter.addPortfolioAsset).toHaveBeenCalledWith(assetData)
  })

  it('should handle validation errors', async () => {
    const invalidData = {
      assetName: '', // Invalid: empty name
      symbol: 'SOL',
      quantity: -100 // Invalid: negative quantity
    }

    const request = new Request('http://localhost:3000/api/add-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.success).toBe(false)
    expect(result.error).toContain('validation')
  })

  it('should handle missing required fields', async () => {
    const incompleteData = {
      assetName: 'Solana'
      // Missing required fields
    }

    const request = new Request('http://localhost:3000/api/add-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteData)
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.success).toBe(false)
  })

  it('should handle sheets adapter errors', async () => {
    const assetData = {
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

    const mockError = {
      success: false,
      error: 'Failed to add asset to sheet'
    }

    mockSheetsAdapter.addPortfolioAsset.mockResolvedValue(mockError)

    const request = new Request('http://localhost:3000/api/add-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual(mockError)
  })

  it('should handle exceptions', async () => {
    const assetData = {
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

    mockSheetsAdapter.addPortfolioAsset.mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/add-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Database error')
  })
})
