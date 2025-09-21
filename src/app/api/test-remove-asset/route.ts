import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function GET(request: Request) {
  try {
    console.log('=== TEST REMOVE ASSET ENDPOINT ===');
    
    // Test SheetsAdapter connection
    console.log('Testing SheetsAdapter connection...');
    const connectionTest = await sheetsAdapter.testConnection();
    console.log('Connection test result:', connectionTest);
    
    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        connectionTest
      }, { status: 500 });
    }

    // Test getting portfolio data
    console.log('Testing portfolio data fetch...');
    const portfolioData = await sheetsAdapter.getPortfolioData();
    console.log('Portfolio data result:', {
      success: true,
      assetCount: portfolioData.length || 0,
      firstAsset: portfolioData[0]?.symbol || 'none'
    });

    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      connectionTest,
      portfolioData: {
        success: true,
        assetCount: portfolioData.length || 0,
        sampleAsset: portfolioData[0]?.symbol || 'none'
      }
    });

  } catch (error: unknown) {
    console.error('Error in test-remove-asset endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
