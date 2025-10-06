import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json();
    
    if (!symbol) {
      return NextResponse.json({
        success: false,
        error: 'Symbol parameter is required'
      }, { status: 400 });
    }

    console.log(`=== DEBUGGING PERSONAL PORTFOLIO DELETION FOR ${symbol} ===`);

    // Step 1: Test SheetsAdapter initialization
    console.log('Step 1: Testing SheetsAdapter initialization...');
    const connectionTest = await sheetsAdapter.testConnection();
    console.log('Connection test result:', connectionTest);
    
    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'SheetsAdapter connection failed',
        step: 'connection_test'
      });
    }

    // Step 2: Get Personal Portfolio data
    console.log('Step 2: Getting Personal Portfolio data...');
    const portfolioData = await sheetsAdapter.getPersonalPortfolioData();
    console.log('Portfolio data retrieved:', {
      assetCount: portfolioData.length,
      assets: portfolioData.map(asset => ({ symbol: asset.symbol, assetName: asset.assetName }))
    });

    // Step 3: Check if asset exists
    console.log(`Step 3: Checking if asset ${symbol} exists...`);
    const assetExists = portfolioData.find(asset => 
      asset.symbol?.toUpperCase() === symbol.toUpperCase()
    );
    console.log('Asset found:', assetExists ? 'YES' : 'NO');
    
    if (assetExists) {
      console.log('Asset details:', assetExists);
    }

    // Step 4: Test the actual removal (dry run)
    console.log('Step 4: Testing removal method...');
    try {
      const result = await sheetsAdapter.removePersonalAsset(symbol);
      console.log('Removal result:', result);
      
      return NextResponse.json({
        success: true,
        debug: {
          step1_connection: connectionTest,
          step2_portfolioData: {
            assetCount: portfolioData.length,
            assets: portfolioData.map(asset => ({ symbol: asset.symbol, assetName: asset.assetName }))
          },
          step3_assetExists: !!assetExists,
          step3_assetDetails: assetExists,
          step4_removalResult: result
        }
      });
    } catch (removalError) {
      console.error('Removal error:', removalError);
      return NextResponse.json({
        success: false,
        error: 'Removal failed',
        step: 'removal_test',
        details: removalError instanceof Error ? removalError.message : 'Unknown error',
        debug: {
          step1_connection: connectionTest,
          step2_portfolioData: {
            assetCount: portfolioData.length,
            assets: portfolioData.map(asset => ({ symbol: asset.symbol, assetName: asset.assetName }))
          },
          step3_assetExists: !!assetExists,
          step3_assetDetails: assetExists
        }
      });
    }

  } catch (error: unknown) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
