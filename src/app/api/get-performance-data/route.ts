import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import errorMonitor from '@/lib/errorMonitor';
import { withApiMiddleware } from '@/lib/apiMiddleware';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export interface PerformanceData {
  month: string;
  endingAUM: number;
  wagmiMoM: number;
  totalMoM: number;
  total3MoM: number;
  wagmiCumulative: number;
  totalCumulative: number;
  total3Cumulative: number;
}

async function getPerformanceDataHandler(req: NextRequest) {
  try {
    logger.info('Fetching performance data using SheetsAdapter');
    
    // Use new SheetsAdapter method
    const performanceData = await sheetsAdapter.getWagmiHistoricalPerformance();

    logger.info('Performance data fetched successfully', {
      recordCount: performanceData.length,
      months: performanceData.map(d => d.month)
    });

    return NextResponse.json({
      success: true,
      data: performanceData,
      source: 'SheetsAdapter.getWagmiHistoricalPerformance()'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Error fetching performance data:', errorObj);
    errorMonitor.recordError(errorObj);
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

// Wrap with API middleware for logging and monitoring
export const GET = withApiMiddleware(getPerformanceDataHandler);