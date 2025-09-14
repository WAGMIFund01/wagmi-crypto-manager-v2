import { NextRequest, NextResponse } from 'next/server';
import { PriceService } from '@/features/pricing/services/PriceService';
import { pricingConfig } from '@/features/pricing/config/pricingConfig';

// Initialize the price service
const priceService = new PriceService(pricingConfig);

/**
 * Unified price update endpoint using the new pricing module
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Unified price update endpoint called');
    
    // Parse request body for specific update type
    const body = await request.json().catch(() => ({}));
    const { type = 'all', symbol, coinGeckoId } = body;

    let result;

    switch (type) {
      case 'all':
        console.log('Updating all prices...');
        result = await priceService.updateAllPrices();
        break;
        
      case 'single':
        if (!symbol || !coinGeckoId) {
          return NextResponse.json({
            success: false,
            error: 'Symbol and coinGeckoId are required for single price update',
            errorCode: 'MISSING_PARAMETERS'
          }, { status: 400 });
        }
        console.log(`Updating single price for ${symbol}...`);
        result = await priceService.updateSinglePrice(symbol, coinGeckoId);
        break;
        
      case 'changes':
        console.log('Updating price changes...');
        result = await priceService.updatePriceChanges();
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid update type. Use "all", "single", or "changes"',
          errorCode: 'INVALID_UPDATE_TYPE'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Successfully updated ${result.updatedCount} assets`
        : 'Price update failed',
      updatedCount: result.updatedCount,
      errors: result.errors,
      timestamp: result.timestamp,
      updateType: type
    });

  } catch (error) {
    console.error('Unified price update error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorCode: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * GET endpoint for API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/update-prices-unified',
    description: 'Unified price update endpoint using the new pricing module',
    methods: {
      POST: {
        description: 'Update prices using the centralized pricing service',
        body: {
          type: {
            description: 'Type of update to perform',
            options: ['all', 'single', 'changes'],
            default: 'all'
          },
          symbol: {
            description: 'Asset symbol (required for single updates)',
            example: 'AURA'
          },
          coinGeckoId: {
            description: 'CoinGecko ID (required for single updates)',
            example: 'aura-network'
          }
        },
        examples: {
          updateAll: {
            method: 'POST',
            body: { type: 'all' }
          },
          updateSingle: {
            method: 'POST',
            body: { 
              type: 'single', 
              symbol: 'AURA', 
              coinGeckoId: 'aura-network' 
            }
          },
          updateChanges: {
            method: 'POST',
            body: { type: 'changes' }
          }
        }
      }
    },
    features: [
      'Centralized price management using PriceService',
      'Support for batch and single asset updates',
      'Comprehensive error handling and reporting',
      'Integration with CoinGecko API',
      'Automatic Google Sheets updates',
      'Detailed update summaries and statistics'
    ]
  });
}
