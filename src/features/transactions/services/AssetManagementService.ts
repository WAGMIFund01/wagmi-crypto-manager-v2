/**
 * Service for managing portfolio assets (add/remove operations)
 */

import { sheetsAdapter } from '@/lib/sheetsAdapter';
// import { AssetSearchResult } from './AssetSearchService';

export interface NewAssetData {
  coinGeckoId: string;
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  chain?: string;
  riskLevel?: string;
  location?: string;
  coinType?: string;
  thesis?: string;
}

export interface AssetManagementResult {
  success: boolean;
  message: string;
  error?: string;
}

export class AssetManagementService {
  /**
   * Add a new asset to the portfolio
   */
  async addAsset(assetData: NewAssetData): Promise<AssetManagementResult> {
    try {
      // Validate required fields
      if (!assetData.coinGeckoId || !assetData.symbol || !assetData.name || !assetData.quantity) {
        return {
          success: false,
          message: 'Missing required fields',
          error: 'coinGeckoId, symbol, name, and quantity are required'
        };
      }

      if (assetData.quantity <= 0) {
        return {
          success: false,
          message: 'Invalid quantity',
          error: 'Quantity must be greater than 0'
        };
      }

      // Prepare asset data for Google Sheets
      // Note: Total Value (Column I) is completely skipped to preserve Google Sheets formula
      const assetRow = [
        assetData.name,                    // Column A: Asset Name
        assetData.symbol,                  // Column B: Symbol
        assetData.chain || '',            // Column C: Chain
        assetData.riskLevel || 'Medium',  // Column D: Risk Level
        assetData.location || '',         // Column E: Location
        assetData.coinType || 'Altcoin',  // Column F: Coin Type
        assetData.quantity,               // Column G: Quantity
        assetData.currentPrice,           // Column H: Current Price
        // Column I: Total Value - SKIPPED COMPLETELY (preserve Google Sheets formula)
        new Date().toISOString(),         // Column J: Last Price Update
        assetData.coinGeckoId,            // Column K: CoinGecko ID
        0,                                // Column L: 24hr Price Change (will be updated by price service)
        assetData.thesis || ''            // Column M: Thesis
      ];

      // Add the asset to the portfolio using SheetsAdapter
      await sheetsAdapter.addPortfolioAsset(assetRow);

      return {
        success: true,
        message: `Successfully added ${assetData.quantity} ${assetData.symbol} to portfolio`
      };

    } catch (error) {
      console.error('Error adding asset:', error);
      return {
        success: false,
        message: 'Failed to add asset',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Remove an asset from the portfolio
   */
  async removeAsset(symbol: string): Promise<AssetManagementResult> {
    try {
      if (!symbol || symbol.trim().length === 0) {
        return {
          success: false,
          message: 'Symbol is required',
          error: 'Asset symbol cannot be empty'
        };
      }

      // Remove the asset using SheetsAdapter
      await sheetsAdapter.removePortfolioAsset(symbol.toUpperCase());

      return {
        success: true,
        message: `Successfully removed ${symbol.toUpperCase()} from portfolio`
      };

    } catch (error) {
      console.error('Error removing asset:', error);
      return {
        success: false,
        message: 'Failed to remove asset',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate asset data before adding
   */
  validateAssetData(assetData: Partial<NewAssetData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!assetData.coinGeckoId?.trim()) {
      errors.push('CoinGecko ID is required');
    }

    if (!assetData.symbol?.trim()) {
      errors.push('Symbol is required');
    }

    if (!assetData.name?.trim()) {
      errors.push('Asset name is required');
    }

    if (!assetData.quantity || assetData.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!assetData.currentPrice || assetData.currentPrice <= 0) {
      errors.push('Current price must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Add a new asset to the personal portfolio
   */
  async addPersonalAsset(assetData: NewAssetData): Promise<AssetManagementResult> {
    try {
      console.log('Adding personal asset:', assetData);

      // Validate the asset data
      const validation = this.validateAssetData(assetData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Validation failed',
          error: validation.errors.join(', ')
        };
      }

      // Use the sheets adapter to add the asset to personal portfolio
      const result = await sheetsAdapter.addPersonalAsset(assetData);

      if (result.success) {
        return {
          success: true,
          message: 'Personal asset added successfully'
        };
      } else {
        return {
          success: false,
          message: 'Failed to add personal asset',
          error: result.error
        };
      }

    } catch (error) {
      console.error('Error adding personal asset:', error);
      return {
        success: false,
        message: 'Failed to add personal asset',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Remove an asset from the personal portfolio
   */
  async removePersonalAsset(symbol: string): Promise<AssetManagementResult> {
    try {
      console.log('Removing personal asset:', symbol);

      if (!symbol || symbol.trim().length === 0) {
        return {
          success: false,
          message: 'Symbol is required',
          error: 'Symbol parameter is missing'
        };
      }

      // Use the sheets adapter to remove the asset from personal portfolio
      const result = await sheetsAdapter.removePersonalAsset(symbol.trim().toUpperCase());

      if (result.success) {
        return {
          success: true,
          message: `Personal asset ${symbol} removed successfully`
        };
      } else {
        return {
          success: false,
          message: 'Failed to remove personal asset',
          error: result.error
        };
      }

    } catch (error) {
      console.error('Error removing personal asset:', error);
      return {
        success: false,
        message: 'Failed to remove personal asset',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const assetManagementService = new AssetManagementService();
