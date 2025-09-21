import { vi } from 'vitest'

// Mock Google Sheets API responses
export const mockSheetsData = {
  investors: [
    ['Investor ID', 'Name', 'Email', 'Join Date', 'Investment Value', 'Current Value', 'Share %', 'Return %'],
    ['INV001', 'John Doe', 'john@example.com', '2024-01-15', '10000', '12000', '25.5', '20.0'],
    ['INV002', 'Jane Smith', 'jane@example.com', '2024-02-01', '15000', '18000', '38.2', '20.0'],
  ],
  portfolio: [
    ['Asset Name', 'Symbol', 'Chain', 'Risk Level', 'Location', 'Coin Type', 'Quantity', 'Current Price', 'Total Value', 'Last Price Update', 'Price Change 24h', 'CoinGecko ID', 'Thesis'],
    ['Bitcoin', 'BTC', 'Bitcoin', 'Low', 'Cold Storage', 'Major', '0.5', '45000', '22500', '2024-01-15', '2.5', 'bitcoin', 'Long-term store of value'],
    ['Ethereum', 'ETH', 'Ethereum', 'Medium', 'Hot Wallet', 'Major', '10', '3000', '30000', '2024-01-15', '1.8', 'ethereum', 'Smart contract platform'],
  ],
  kpi: [
    ['Active Investors', 'Total AUM', 'Cumulative Return', 'Month on Month'],
    ['2', '50000', '20.0', '5.2'],
  ]
}

// Mock Google Sheets API
export const mockGoogleSheets = {
  spreadsheets: {
    values: {
      get: vi.fn(),
      update: vi.fn(),
      append: vi.fn(),
      batchUpdate: vi.fn(),
    }
  }
}

// Mock Google Auth
export const mockGoogleAuth = {
  fromJSON: vi.fn().mockReturnValue({
    authorize: vi.fn().mockResolvedValue(undefined)
  })
}

// Setup default mock implementations
export const setupSheetsMocks = () => {
  // Mock successful responses
  mockGoogleSheets.spreadsheets.values.get.mockImplementation((params: any) => {
    const range = params.range
    
    if (range.includes('Investors')) {
      return Promise.resolve({
        data: {
          values: mockSheetsData.investors
        }
      })
    }
    
    if (range.includes('Portfolio Overview')) {
      return Promise.resolve({
        data: {
          values: mockSheetsData.portfolio
        }
      })
    }
    
    if (range.includes('KPI')) {
      return Promise.resolve({
        data: {
          values: mockSheetsData.kpi
        }
      })
    }
    
    return Promise.resolve({
      data: {
        values: []
      }
    })
  })

  mockGoogleSheets.spreadsheets.values.update.mockResolvedValue({
    data: {
      updatedRows: 1,
      updatedColumns: 1,
      updatedCells: 1
    }
  })

  mockGoogleSheets.spreadsheets.values.append.mockResolvedValue({
    data: {
      updates: {
        updatedRows: 1,
        updatedColumns: 1,
        updatedCells: 1
      }
    }
  })

  mockGoogleSheets.spreadsheets.values.batchUpdate.mockResolvedValue({
    data: {
      totalUpdatedRows: 1,
      totalUpdatedColumns: 1,
      totalUpdatedCells: 1
    }
  })
}

// Mock error responses
export const setupSheetsErrorMocks = () => {
  mockGoogleSheets.spreadsheets.values.get.mockRejectedValue(new Error('Google Sheets API Error'))
  mockGoogleSheets.spreadsheets.values.update.mockRejectedValue(new Error('Update failed'))
  mockGoogleSheets.spreadsheets.values.append.mockRejectedValue(new Error('Append failed'))
  mockGoogleSheets.spreadsheets.values.batchUpdate.mockRejectedValue(new Error('Batch update failed'))
}
