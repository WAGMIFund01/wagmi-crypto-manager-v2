import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({
        success: false,
        error: 'Symbol parameter is required'
      }, { status: 400 });
    }

    console.log(`=== VERIFYING ASSET EXISTS: ${symbol} ===`);

    // Get all portfolio data
    const portfolioAssets = await sheetsAdapter.getPortfolioData();
    
    // Check if the asset exists
    const assetExists = portfolioAssets.some(asset => 
      asset.symbol?.toUpperCase() === symbol.toUpperCase()
    );

    const matchingAssets = portfolioAssets.filter(asset => 
      asset.symbol?.toUpperCase() === symbol.toUpperCase()
    );

    console.log(`Asset ${symbol} exists: ${assetExists}`);
    console.log(`Matching assets:`, matchingAssets);

    return NextResponse.json({
      success: true,
      symbol: symbol.toUpperCase(),
      exists: assetExists,
      matchingAssets: matchingAssets,
      totalAssets: portfolioAssets.length,
      allSymbols: portfolioAssets.map(asset => asset.symbol)
    });

  } catch (error: unknown) {
    console.error('Error in verify-asset-exists endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
