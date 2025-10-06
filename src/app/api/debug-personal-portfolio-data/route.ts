import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function GET() {
  try {
    console.log('=== GETTING PERSONAL PORTFOLIO DATA FOR DEBUG ===');

    // Test connection first
    const connectionTest = await sheetsAdapter.testConnection();
    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'Connection failed'
      });
    }

    // Get the data
    const portfolioData = await sheetsAdapter.getPersonalPortfolioData();
    
    console.log('Personal Portfolio data:', {
      assetCount: portfolioData.length,
      assets: portfolioData.map(asset => ({
        symbol: asset.symbol,
        assetName: asset.assetName,
        quantity: asset.quantity,
        totalValue: asset.totalValue
      }))
    });

    return NextResponse.json({
      success: true,
      data: {
        assetCount: portfolioData.length,
        assets: portfolioData.map(asset => ({
          symbol: asset.symbol,
          assetName: asset.assetName,
          quantity: asset.quantity,
          totalValue: asset.totalValue,
          riskLevel: asset.riskLevel,
          location: asset.location
        }))
      }
    });

  } catch (error: unknown) {
    console.error('Debug personal portfolio data error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
