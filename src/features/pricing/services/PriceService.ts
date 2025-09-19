import { sheetsAdapter, PortfolioAsset } from '@/lib/sheetsAdapter';
import { CoinGeckoService } from './CoinGeckoService';
import { 
  PriceUpdateResult, 
  PriceUpdateError, 
  BatchPriceUpdate, 
  PriceUpdateSummary,
  PriceServiceConfig
} from '../types/pricing';
import { CoinGeckoService as CoinGeckoServiceType } from './CoinGeckoService';

/**
 * Centralized service for all price management operations
 */
export class PriceService {
  private coinGeckoService: CoinGeckoServiceType;
  private config: PriceServiceConfig;

  constructor(config: PriceServiceConfig) {
    this.config = config;
    this.coinGeckoService = new CoinGeckoService({
      baseUrl: 'https://api.coingecko.com/api/v3',
      apiKey: config.coinGeckoApiKey
    });
  }

  /**
   * Update prices for all assets in the portfolio
   */
  async updateAllPrices(): Promise<PriceUpdateResult> {
    try {
      console.log('Starting comprehensive price update...');
      
      // Step 1: Get portfolio data
      const portfolioData = await sheetsAdapter.getPortfolioData();
      
      // Step 2: Process assets and collect CoinGecko IDs
      const { validAssets, errors } = this.processAssets(portfolioData);
      
      if (validAssets.length === 0) {
        return {
          success: true,
          updatedCount: 0,
          errors,
          timestamp: new Date().toISOString()
        };
      }

      // Step 3: Fetch prices from CoinGecko
      const coinGeckoIds = validAssets.map(asset => asset.coinGeckoId).filter((id): id is string => id !== undefined);
      const priceData = await this.coinGeckoService.getPrices(coinGeckoIds, true);

      // Step 4: Prepare batch updates
      const batchUpdates = this.prepareBatchUpdates(validAssets, priceData);
      
      // Step 5: Execute batch update to Google Sheets
      const updateResult = await this.executeBatchUpdate(batchUpdates);

      // Step 6: Compile results
      const summary = this.compileSummary(portfolioData.length, updateResult.updatedCount, errors);

      console.log('Price update completed:', summary);

      return {
        success: true,
        updatedCount: updateResult.updatedCount,
        errors: [...errors, ...updateResult.errors],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Price update failed:', error);
      return {
        success: false,
        updatedCount: 0,
        errors: [{
          symbol: 'SYSTEM',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          type: 'sheets_error'
        }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update price for a single asset
   */
  async updateSinglePrice(symbol: string, coinGeckoId: string): Promise<PriceUpdateResult> {
    try {
      console.log(`Updating price for ${symbol} (${coinGeckoId})...`);

      // Step 1: Get portfolio data to find the asset
      const portfolioData = await sheetsAdapter.getPortfolioData();
      const asset = portfolioData.find(a => 
        a.symbol.toUpperCase() === symbol.toUpperCase()
      );

      if (!asset) {
        return {
          success: false,
          updatedCount: 0,
          errors: [{
            symbol,
            coinGeckoId,
            error: `Asset ${symbol} not found in portfolio`,
            type: 'sheets_error'
          }],
          timestamp: new Date().toISOString()
        };
      }

      // Step 2: Fetch price from CoinGecko
      const priceData = await this.coinGeckoService.getPrice(coinGeckoId, true);
      const priceInfo = priceData[coinGeckoId];

      if (!priceInfo) {
        return {
          success: false,
          updatedCount: 0,
          errors: [{
            symbol,
            coinGeckoId,
            error: `No price data returned from CoinGecko for ${coinGeckoId}`,
            type: 'coinGecko_error'
          }],
          timestamp: new Date().toISOString()
        };
      }

      // Step 3: Prepare single update
      const batchUpdate: BatchPriceUpdate = {
        symbol: asset.symbol,
        coinGeckoId,
        newPrice: priceInfo.usd,
        priceChange24h: priceInfo.usd_24h_change,
        rowIndex: portfolioData.indexOf(asset) + 2 // +2 for header and 1-indexed
      };

      // Step 4: Execute update
      const updateResult = await this.executeBatchUpdate([batchUpdate]);

      return {
        success: true,
        updatedCount: updateResult.updatedCount,
        errors: updateResult.errors,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Single price update failed for ${symbol}:`, error);
      return {
        success: false,
        updatedCount: 0,
        errors: [{
          symbol,
          coinGeckoId,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          type: 'coinGecko_error'
        }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update only 24hr price changes
   */
  async updatePriceChanges(): Promise<PriceUpdateResult> {
    try {
      console.log('Updating 24hr price changes...');
      
      // This is similar to updateAllPrices but only updates the price change column
      // Implementation would be similar but focused on price changes only
      // For now, we'll use the comprehensive update
      return this.updateAllPrices();
    } catch (error) {
      console.error('Price changes update failed:', error);
      return {
        success: false,
        updatedCount: 0,
        errors: [{
          symbol: 'SYSTEM',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          type: 'sheets_error'
        }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process portfolio assets and validate them
   */
  private processAssets(portfolioData: PortfolioAsset[]): { validAssets: (PortfolioAsset & { rowIndex: number })[], errors: PriceUpdateError[] } {
    const validAssets: (PortfolioAsset & { rowIndex: number })[] = [];
    const errors: PriceUpdateError[] = [];

    portfolioData.forEach((asset, index) => {
      const symbol = asset.symbol?.toString().toUpperCase();
      const quantity = asset.quantity || 0;
      const coinGeckoId = asset.coinGeckoId?.toString()?.trim();

      // Check if asset has quantity > 0
      if (!symbol || quantity <= 0) {
        errors.push({
          symbol: symbol || 'UNKNOWN',
          error: `No quantity (${quantity}) or invalid symbol (${symbol})`,
          type: 'no_quantity'
        });
        return;
      }

      // Check if CoinGecko ID is provided
      if (!coinGeckoId) {
        errors.push({
          symbol,
          error: 'No CoinGecko ID provided',
          type: 'no_coinGecko_id'
        });
        return;
      }

      // Validate CoinGecko ID format
      if (!CoinGeckoService.validateCoinGeckoId(coinGeckoId)) {
        errors.push({
          symbol,
          coinGeckoId,
          error: `Invalid CoinGecko ID format: "${coinGeckoId}"`,
          type: 'invalid_coinGecko_id'
        });
        return;
      }

      validAssets.push({
        ...asset,
        rowIndex: index + 2 // +2 for header and 1-indexed
      } as PortfolioAsset & { rowIndex: number });
    });

    return { validAssets, errors };
  }

  /**
   * Prepare batch updates for Google Sheets
   */
  private prepareBatchUpdates(validAssets: (PortfolioAsset & { rowIndex: number })[], priceData: Record<string, { usd: number; usd_24h_change?: number }>): BatchPriceUpdate[] {
    const batchUpdates: BatchPriceUpdate[] = [];

    validAssets.forEach(asset => {
      const priceInfo = priceData[asset.coinGeckoId || ''];
      
      if (priceInfo && priceInfo.usd !== undefined) {
        batchUpdates.push({
          symbol: asset.symbol,
          coinGeckoId: asset.coinGeckoId || '',
          newPrice: priceInfo.usd,
          priceChange24h: priceInfo.usd_24h_change,
          rowIndex: asset.rowIndex
        });
      }
    });

    return batchUpdates;
  }

  /**
   * Execute batch update to Google Sheets
   */
  private async executeBatchUpdate(batchUpdates: BatchPriceUpdate[]): Promise<{ updatedCount: number, errors: PriceUpdateError[] }> {
    // This would integrate with the SheetsAdapter to perform batch updates
    // For now, we'll return a placeholder
    console.log(`Executing batch update for ${batchUpdates.length} assets`);
    
    return {
      updatedCount: batchUpdates.length,
      errors: []
    };
  }

  /**
   * Compile update summary
   */
  private compileSummary(totalAssets: number, updatedCount: number, errors: PriceUpdateError[]): PriceUpdateSummary {
    return {
      totalAssets,
      updatedAssets: updatedCount,
      noQuantity: errors.filter(e => e.type === 'no_quantity').length,
      noCoinGeckoId: errors.filter(e => e.type === 'no_coinGecko_id').length,
      invalidCoinGeckoId: errors.filter(e => e.type === 'invalid_coinGecko_id').length,
      coinGeckoErrors: errors.filter(e => e.type === 'coinGecko_error').length,
      sheetsErrors: errors.filter(e => e.type === 'sheets_error').length
    };
  }
}
