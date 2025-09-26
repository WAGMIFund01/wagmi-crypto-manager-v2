import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    logger.info('Fetching personal portfolio data', { requestId });
    
    // Get Personal Portfolio data using sheetsAdapter method
    const assets = await sheetsAdapter.getPersonalPortfolioData();

    logger.info('Personal portfolio data fetched successfully', { 
      requestId, 
      assetCount: assets.length 
    });

    return NextResponse.json({
      success: true,
      assets
    });

  } catch (error) {
    logger.error('Error fetching personal portfolio data', error instanceof Error ? error : new Error('Unknown error'), { 
      requestId
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch personal portfolio data'
    }, { status: 500 });
  }
}
