import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import logger from '@/lib/logger';
import errorMonitor from '@/lib/errorMonitor';
import { withApiMiddleware } from '@/lib/apiMiddleware';

async function handler(req: NextRequest) {
  try {
    logger.info('Fetching personal portfolio data');
    
    // Fetch data from the "Personal portfolio" sheet
    const personalPortfolioData = await sheetsAdapter.getPersonalPortfolioData();
    
    logger.info('Personal portfolio data fetched successfully', { 
      assetCount: personalPortfolioData.length 
    });

    return NextResponse.json({
      success: true,
      assets: personalPortfolioData,
      count: personalPortfolioData.length
    });

  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Error fetching personal portfolio data:', errorObj);
    errorMonitor.recordError(errorObj, {
      endpoint: '/api/get-personal-portfolio-data',
      additionalContext: { operation: 'fetch_personal_portfolio_data' }
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch personal portfolio data',
        details: errorObj.message 
      },
      { status: 500 }
    );
  }
}

export const GET = withApiMiddleware(handler);
