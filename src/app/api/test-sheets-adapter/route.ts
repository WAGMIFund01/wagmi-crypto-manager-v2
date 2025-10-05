import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

/**
 * Test endpoint for validating new SheetsAdapter methods
 * Week 2: Testing Phase - Zero production impact
 * 
 * This endpoint allows testing all 10 new methods in isolation
 * and comparing results with existing endpoints
 */

export async function POST(request: NextRequest) {
  try {
    const { method, params = {} } = await request.json();

    console.log(`🧪 Testing SheetsAdapter method: ${method}`);
    console.log('📋 Parameters:', params);

    let result: any;
    let comparison: any = null;

    switch (method) {
      // ============================================================================
      // TIMESTAMP METHODS
      // ============================================================================
      
      case 'getWagmiTimestamp':
        console.log('📝 Testing getWagmiTimestamp()...');
        result = await sheetsAdapter.getWagmiTimestamp();
        
        // Compare with existing endpoint
        try {
          const existingResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/get-last-updated-timestamp`);
          comparison = await existingResponse.json();
        } catch (error) {
          comparison = { error: 'Failed to fetch comparison data' };
        }
        
        return NextResponse.json({
          success: true,
          method,
          result,
          comparison,
          match: result === comparison?.timestamp,
          timestamp: new Date().toISOString()
        });

      case 'getPersonalPortfolioTimestamp':
        console.log('📝 Testing getPersonalPortfolioTimestamp()...');
        result = await sheetsAdapter.getPersonalPortfolioTimestamp();
        
        // Compare with existing endpoint
        try {
          const existingResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/get-personal-portfolio-timestamp`);
          comparison = await existingResponse.json();
        } catch (error) {
          comparison = { error: 'Failed to fetch comparison data' };
        }
        
        return NextResponse.json({
          success: true,
          method,
          result,
          comparison,
          match: result === comparison?.timestamp,
          timestamp: new Date().toISOString()
        });

      case 'updateKpiTimestamp':
        console.log('📝 Testing updateKpiTimestamp()...');
        const { timestamp, isPersonalPortfolio } = params;
        
        if (!timestamp) {
          return NextResponse.json({
            success: false,
            error: 'Missing required parameter: timestamp'
          }, { status: 400 });
        }
        
        result = await sheetsAdapter.updateKpiTimestamp(timestamp, isPersonalPortfolio || false);
        
        return NextResponse.json({
          success: true,
          method,
          params: { timestamp, isPersonalPortfolio },
          result,
          note: `Updated cell ${isPersonalPortfolio ? 'B9' : 'B7'} in KPIs sheet`,
          timestamp: new Date().toISOString()
        });

      // ============================================================================
      // 24H PRICE CHANGES
      // ============================================================================
      
      case 'get24HourChanges':
        console.log('📝 Testing get24HourChanges()...');
        const { isPersonalPortfolio: isPersonal } = params;
        
        result = await sheetsAdapter.get24HourChanges(isPersonal || false);
        
        return NextResponse.json({
          success: true,
          method,
          params: { isPersonalPortfolio: isPersonal },
          result,
          count: result.length,
          sample: result.slice(0, 3), // Show first 3 for preview
          timestamp: new Date().toISOString()
        });

      // ============================================================================
      // TRANSACTION DATA
      // ============================================================================
      
      case 'getTransactions':
        console.log('📝 Testing getTransactions()...');
        const { investorId } = params;
        
        if (!investorId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required parameter: investorId'
          }, { status: 400 });
        }
        
        result = await sheetsAdapter.getTransactions(investorId);
        
        // Compare with existing endpoint
        try {
          const existingResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/get-transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ investorId })
          });
          comparison = await existingResponse.json();
        } catch (error) {
          comparison = { error: 'Failed to fetch comparison data' };
        }
        
        return NextResponse.json({
          success: true,
          method,
          params: { investorId },
          result,
          comparison,
          match: JSON.stringify(result) === JSON.stringify(comparison?.transactions),
          count: result.length,
          timestamp: new Date().toISOString()
        });

      // ============================================================================
      // HISTORICAL PERFORMANCE DATA
      // ============================================================================
      
      case 'getWagmiHistoricalPerformance':
        console.log('📝 Testing getWagmiHistoricalPerformance()...');
        result = await sheetsAdapter.getWagmiHistoricalPerformance();
        
        // Compare with existing endpoint
        try {
          const existingResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/get-performance-data`);
          comparison = await existingResponse.json();
        } catch (error) {
          comparison = { error: 'Failed to fetch comparison data' };
        }
        
        return NextResponse.json({
          success: true,
          method,
          result,
          comparison,
          match: JSON.stringify(result) === JSON.stringify(comparison?.data),
          count: result.length,
          sample: result.slice(0, 3), // Show first 3 months
          timestamp: new Date().toISOString()
        });

      case 'getPersonalPortfolioHistoricalPerformance':
        console.log('📝 Testing getPersonalPortfolioHistoricalPerformance()...');
        result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();
        
        // Compare with existing endpoint
        try {
          const existingResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/get-personal-portfolio-performance-data`);
          comparison = await existingResponse.json();
        } catch (error) {
          comparison = { error: 'Failed to fetch comparison data' };
        }
        
        return NextResponse.json({
          success: true,
          method,
          result,
          comparison,
          match: JSON.stringify(result) === JSON.stringify(comparison?.data),
          count: result.length,
          sample: result.slice(0, 3), // Show first 3 months
          timestamp: new Date().toISOString()
        });

      // ============================================================================
      // PRICE UPDATE METHODS (DRY-RUN MODE)
      // ============================================================================
      
      case 'updateAssetPrice':
        console.log('📝 Testing updateAssetPrice() [DRY-RUN]...');
        const { symbol, price, priceTimestamp, priceChange24h, isPersonalPortfolio: isPersonalPrice } = params;
        
        if (!symbol || !price || !priceTimestamp || priceChange24h === undefined) {
          return NextResponse.json({
            success: false,
            error: 'Missing required parameters: symbol, price, priceTimestamp, priceChange24h'
          }, { status: 400 });
        }
        
        // DRY-RUN: Only test if explicitly confirmed
        if (params.confirm === true) {
          result = await sheetsAdapter.updateAssetPrice(
            symbol,
            price,
            priceTimestamp,
            priceChange24h,
            isPersonalPrice || false
          );
        } else {
          result = {
            dryRun: true,
            message: 'Dry-run mode - no actual update performed',
            wouldUpdate: {
              symbol,
              price,
              priceTimestamp,
              priceChange24h,
              portfolio: isPersonalPrice ? 'Personal Portfolio' : 'WAGMI Fund',
              cells: {
                price: `${isPersonalPrice ? 'Personal portfolio' : 'Portfolio Overview'}!H[row]`,
                timestamp: `${isPersonalPrice ? 'Personal portfolio' : 'Portfolio Overview'}!J[row]`,
                change: `${isPersonalPrice ? 'Personal portfolio' : 'Portfolio Overview'}!L[row]`
              }
            }
          };
        }
        
        return NextResponse.json({
          success: true,
          method,
          params,
          result,
          note: params.confirm ? 'ACTUAL UPDATE PERFORMED' : 'DRY-RUN MODE - Add confirm:true to execute',
          timestamp: new Date().toISOString()
        });

      case 'batchUpdatePrices':
        console.log('📝 Testing batchUpdatePrices() [DRY-RUN]...');
        const { updates, isPersonalPortfolio: isPersonalBatch } = params;
        
        if (!updates || !Array.isArray(updates)) {
          return NextResponse.json({
            success: false,
            error: 'Missing required parameter: updates (array)'
          }, { status: 400 });
        }
        
        // DRY-RUN: Only test if explicitly confirmed
        if (params.confirm === true) {
          result = await sheetsAdapter.batchUpdatePrices(updates, isPersonalBatch || false);
        } else {
          result = {
            dryRun: true,
            message: 'Dry-run mode - no actual updates performed',
            wouldUpdate: {
              count: updates.length,
              portfolio: isPersonalBatch ? 'Personal Portfolio' : 'WAGMI Fund',
              updates: updates.map((u: any) => ({
                symbol: u.symbol,
                price: u.price,
                priceChange24h: u.priceChange24h
              }))
            }
          };
        }
        
        return NextResponse.json({
          success: true,
          method,
          params: { updateCount: updates.length, isPersonalPortfolio: isPersonalBatch },
          result,
          note: params.confirm ? 'ACTUAL UPDATES PERFORMED' : 'DRY-RUN MODE - Add confirm:true to execute',
          timestamp: new Date().toISOString()
        });

      // ============================================================================
      // UNKNOWN METHOD
      // ============================================================================
      
      default:
        return NextResponse.json({
          success: false,
          error: `Unknown test method: ${method}`,
          availableMethods: [
            'getWagmiTimestamp',
            'getPersonalPortfolioTimestamp',
            'updateKpiTimestamp',
            'get24HourChanges',
            'getTransactions',
            'getWagmiHistoricalPerformance',
            'getPersonalPortfolioHistoricalPerformance',
            'updateAssetPrice',
            'batchUpdatePrices'
          ]
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * GET endpoint - Returns documentation and usage examples
 */
export async function GET() {
  return NextResponse.json({
    name: 'SheetsAdapter Test Endpoint',
    version: '1.0.0',
    purpose: 'Test and validate all new SheetsAdapter methods before production migration',
    week: 'Week 2 - Testing Phase',
    risk: 'ZERO - Testing only',
    
    usage: {
      method: 'POST',
      contentType: 'application/json',
      body: {
        method: 'string (required) - Method name to test',
        params: 'object (optional) - Parameters for the method',
        confirm: 'boolean (optional) - Set to true to execute write operations (default: dry-run)'
      }
    },
    
    availableMethods: {
      timestamps: [
        {
          method: 'getWagmiTimestamp',
          params: {},
          description: 'Read WAGMI navbar timestamp from KPIs!B7',
          comparison: '/api/get-last-updated-timestamp'
        },
        {
          method: 'getPersonalPortfolioTimestamp',
          params: {},
          description: 'Read Personal Portfolio timestamp from KPIs!B9',
          comparison: '/api/get-personal-portfolio-timestamp'
        },
        {
          method: 'updateKpiTimestamp',
          params: { timestamp: 'string', isPersonalPortfolio: 'boolean' },
          description: 'Update navbar timestamp (B7 for WAGMI, B9 for Personal)',
          note: 'Requires confirm:true to execute'
        }
      ],
      
      priceChanges: [
        {
          method: 'get24HourChanges',
          params: { isPersonalPortfolio: 'boolean' },
          description: 'Get 24h price changes for all assets'
        }
      ],
      
      transactions: [
        {
          method: 'getTransactions',
          params: { investorId: 'string' },
          description: 'Get transaction history for an investor',
          comparison: '/api/get-transactions'
        }
      ],
      
      historicalPerformance: [
        {
          method: 'getWagmiHistoricalPerformance',
          params: {},
          description: 'Get WAGMI Fund monthly performance data',
          comparison: '/api/get-performance-data'
        },
        {
          method: 'getPersonalPortfolioHistoricalPerformance',
          params: {},
          description: 'Get Personal Portfolio monthly performance data',
          comparison: '/api/get-personal-portfolio-performance-data'
        }
      ],
      
      priceUpdates: [
        {
          method: 'updateAssetPrice',
          params: {
            symbol: 'string',
            price: 'number',
            priceTimestamp: 'string',
            priceChange24h: 'number',
            isPersonalPortfolio: 'boolean',
            confirm: 'boolean (required for execution)'
          },
          description: 'Update single asset price, timestamp, and 24h change',
          note: 'DRY-RUN by default - add confirm:true to execute'
        },
        {
          method: 'batchUpdatePrices',
          params: {
            updates: 'array of { symbol, price, timestamp, priceChange24h }',
            isPersonalPortfolio: 'boolean',
            confirm: 'boolean (required for execution)'
          },
          description: 'Update multiple assets at once',
          note: 'DRY-RUN by default - add confirm:true to execute'
        }
      ]
    },
    
    examples: [
      {
        title: 'Test WAGMI timestamp read',
        request: {
          method: 'POST',
          body: {
            method: 'getWagmiTimestamp'
          }
        }
      },
      {
        title: 'Test transaction read',
        request: {
          method: 'POST',
          body: {
            method: 'getTransactions',
            params: { investorId: 'INV001' }
          }
        }
      },
      {
        title: 'Test price update (dry-run)',
        request: {
          method: 'POST',
          body: {
            method: 'updateAssetPrice',
            params: {
              symbol: 'BTC',
              price: 45000,
              priceTimestamp: new Date().toISOString(),
              priceChange24h: 2.5,
              isPersonalPortfolio: false
            }
          }
        }
      },
      {
        title: 'Test price update (actual execution)',
        request: {
          method: 'POST',
          body: {
            method: 'updateAssetPrice',
            params: {
              symbol: 'BTC',
              price: 45000,
              priceTimestamp: new Date().toISOString(),
              priceChange24h: 2.5,
              isPersonalPortfolio: false,
              confirm: true
            }
          }
        }
      }
    ],
    
    notes: [
      'All read operations are safe and have zero production impact',
      'Write operations default to DRY-RUN mode',
      'Add confirm:true to params to execute actual write operations',
      'Results are compared with existing endpoints where applicable',
      'All operations are logged for debugging'
    ]
  });
}
