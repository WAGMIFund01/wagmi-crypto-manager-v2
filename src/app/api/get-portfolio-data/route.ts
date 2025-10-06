import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    logger.info('Fetching WAGMI Fund portfolio data', { requestId });
    
    // Get WAGMI Fund data using sheetsAdapter method (direct, no caching)
    const assets = await sheetsAdapter.getPortfolioData();

    logger.info('WAGMI Fund portfolio data fetched successfully', { 
      requestId, 
      assetCount: assets.length 
    });

    return NextResponse.json({
      success: true,
      assets
    });

  } catch (error) {
    logger.error('Error fetching WAGMI Fund portfolio data', error instanceof Error ? error : new Error('Unknown error'), { 
      requestId
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch WAGMI Fund portfolio data'
    }, { status: 500 });
  }
}
