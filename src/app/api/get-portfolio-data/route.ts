import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import logger from '@/lib/logger';
import errorMonitor from '@/lib/errorMonitor';
import { withApiMiddleware } from '@/lib/apiMiddleware';

async function getPortfolioDataHandler(req: NextRequest) {
  try {
    logger.info('Fetching portfolio data');
    
    // Use the unified SheetsAdapter to fetch portfolio data
    const portfolioAssets = await sheetsAdapter.getPortfolioData();

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
