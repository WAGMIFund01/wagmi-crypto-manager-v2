import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import logger from '@/lib/logger';
import errorMonitor from '@/lib/errorMonitor';
import { withApiMiddleware } from '@/lib/apiMiddleware';
import { unstable_cache } from 'next/cache';

// Create a cached version of the personal portfolio data fetching
const getCachedPersonalPortfolioData = unstable_cache(
  async () => {
    return await sheetsAdapter.getPersonalPortfolioData();
  },
  ['personal-portfolio-data'],
  {
    tags: ['personal-portfolio-data'],
    revalidate: 60 // 60 seconds
  }
);

async function getPersonalPortfolioDataHandler(req: NextRequest) {
  try {
    logger.info('Fetching personal portfolio data');
    
    // Use the cached version of personal portfolio data fetching
    const portfolioAssets = await getCachedPersonalPortfolioData();

    logger.info('Personal portfolio data fetched successfully', {
      assetCount: portfolioAssets?.length || 0,
    });

    return NextResponse.json({
      success: true,
      assets: portfolioAssets || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorObj = error as Error;
    logger.error('Failed to fetch personal portfolio data', errorObj, {
      endpoint: '/api/get-personal-portfolio-data',
      errorType: 'personal_portfolio_data_fetch_error',
    });
    
    errorMonitor.recordError('personal_portfolio_data_fetch_error', {
      endpoint: '/api/get-personal-portfolio-data',
      error: errorObj.message
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch personal portfolio data',
      details: errorObj.message
    }, { status: 500 });
  }
}

export const GET = withApiMiddleware(getPersonalPortfolioDataHandler);
