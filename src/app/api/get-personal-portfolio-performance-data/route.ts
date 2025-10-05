import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import errorMonitor from '@/lib/errorMonitor';
import { withApiMiddleware } from '@/lib/apiMiddleware';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import { PersonalPortfolioPerformanceData } from '@/shared/types/performance';

async function getPersonalPortfolioPerformanceDataHandler(req: NextRequest) {
  try {
    logger.info('Fetching personal portfolio performance data using SheetsAdapter');
    
    // Use new SheetsAdapter method
    const performanceData = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

    logger.info('Personal portfolio performance data fetched successfully', {
      dataCount: performanceData.length
    });

    return NextResponse.json({
      success: true,
      data: performanceData,
      source: 'SheetsAdapter.getPersonalPortfolioHistoricalPerformance()'
    });

  } catch (error: unknown) {
    const errorMessage = 'Internal server error during personal portfolio performance data fetch';
    
    logger.error(errorMessage, error as Error, {
      endpoint: '/api/get-personal-portfolio-performance-data',
      errorType: 'personal_portfolio_performance_data_fetch_error',
    });

    // Record error in monitoring system
    errorMonitor.recordError(error as Error, {
      endpoint: '/api/get-personal-portfolio-performance-data',
      additionalContext: {
        operation: 'get_personal_portfolio_performance_data',
        errorType: 'google_sheets_api_error',
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
export const GET = withApiMiddleware(getPersonalPortfolioPerformanceDataHandler);

