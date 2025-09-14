import { NextResponse } from 'next/server';
import { sheetsAdapter, PortfolioAsset } from '@/lib/sheetsAdapter';

export async function GET() {
  try {
    // Use the unified SheetsAdapter to fetch portfolio data
    const portfolioAssets = await sheetsAdapter.getPortfolioData();

    return NextResponse.json({
      success: true,
      assets: portfolioAssets
    });

  } catch (error: unknown) {
    console.error('Error fetching portfolio data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during portfolio data fetch',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
