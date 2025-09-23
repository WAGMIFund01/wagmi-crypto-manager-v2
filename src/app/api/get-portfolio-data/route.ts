import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import logger from '@/lib/logger';
import errorMonitor from '@/lib/errorMonitor';
import { withApiMiddleware } from '@/lib/apiMiddleware';
import { unstable_cache } from 'next/cache';

// Create a cached version of the portfolio data fetching
const getCachedPortfolioData = unstable_cache(
  async () => {
    return await sheetsAdapter.getPortfolioData();
  },
  ['portfolio-data'],
  {
    tags: ['portfolio-data'],
    revalidate: 60 // 60 seconds
  }
);

async function getPortfolioDataHandler(req: NextRequest) {
  try {
    logger.info('Fetching portfolio data');
    
    // Use the cached version of portfolio data fetching
    const portfolioAssets = await getCachedPortfolioData();

    logger.info('Portfolio data fetched successfully', {
      assetCount: portfolioAssets?.length || 0,
    });

    return NextResponse.json({
      success: true,
      assets: portfolioAssets
    });

  } catch (error: unknown) {
    const errorMessage = 'Internal server error during portfolio data fetch';
    
    logger.error(errorMessage, error as Error, {
      endpoint: '/api/get-portfolio-data',
      errorType: 'portfolio_data_fetch_error',
    });

    // Record error in monitoring system
    errorMonitor.recordError(error as Error, {
      endpoint: '/api/get-portfolio-data',
      additionalContext: {
        operation: 'get_portfolio_data',
        errorType: 'sheets_adapter_error',
      },
    });

    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

// Wrap with API middleware for logging and monitoring
export const GET = withApiMiddleware(getPortfolioDataHandler);
