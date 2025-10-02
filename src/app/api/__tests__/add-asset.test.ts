import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../add-asset/route'
import { assetManagementService } from '@/features/transactions/services/AssetManagementService'

// Mock the assetManagementService
vi.mock('@/features/transactions/services/AssetManagementService', () => ({
  assetManagementService: {
    addAsset: vi.fn(),
    validateAssetData: vi.fn()
  }
}))

describe('/api/add-asset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add asset successfully', async () => {
    const assetData = {
      coinGeckoId: 'solana',
      symbol: 'SOL',
      name: 'Solana',
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
      message: `Successfully added ${assetData.quantity} ${assetData.symbol} to portfolio`,
      assetData: {
        symbol: assetData.symbol,
        name: assetData.name,
        quantity: assetData.quantity,
        currentPrice: assetData.currentPrice
      }
    }

    vi.mocked(assetManagementService.validateAssetData).mockReturnValue({
      isValid: true,
      errors: []
    })

    vi.mocked(assetManagementService.addAsset).mockResolvedValue({
      success: true,
      message: `Successfully added ${assetData.quantity} ${assetData.symbol} to portfolio`
    })

    const request = new Request('http://localhost:3000/api/add-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.success).toBe(true)
    expect(result.message).toBe(mockResponse.message)
    expect(assetManagementService.addAsset).toHaveBeenCalledWith({
      ...assetData,
      dataSource: 'wagmi-fund'
    })
  })

  it('should handle validation errors', async () => {
    const invalidData = {
      name: '', // Invalid: empty name
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
    expect(result.error).toContain('Missing required fields')
  })

  it('should handle missing required fields', async () => {
    const incompleteData = {
      name: 'Solana'
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
    expect(result.error).toContain('Missing required fields')
  })

  it('should handle asset management service errors', async () => {
    const assetData = {
      coinGeckoId: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      chain: 'Solana',
      riskLevel: 'Medium',
      location: 'Hot Wallet',
      coinType: 'Altcoin',
      quantity: 100,
      currentPrice: 100,
      thesis: 'High-performance blockchain'
    }

    vi.mocked(assetManagementService.validateAssetData).mockReturnValue({
      isValid: true,
      errors: []
    })

    vi.mocked(assetManagementService.addAsset).mockResolvedValue({
      success: false,
      message: 'Failed to add asset',
      error: 'Sheets API error'
    })

    const request = new Request('http://localhost:3000/api/add-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Sheets API error')
  })

  it('should handle exceptions', async () => {
    const assetData = {
      coinGeckoId: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      chain: 'Solana',
      riskLevel: 'Medium',
      location: 'Hot Wallet',
      coinType: 'Altcoin',
      quantity: 100,
      currentPrice: 100,
      thesis: 'High-performance blockchain'
    }

    vi.mocked(assetManagementService.validateAssetData).mockReturnValue({
      isValid: true,
      errors: []
    })

    vi.mocked(assetManagementService.addAsset).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/add-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Internal server error')
  })
})