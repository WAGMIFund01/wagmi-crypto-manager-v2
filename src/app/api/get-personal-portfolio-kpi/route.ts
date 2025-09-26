import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    logger.info('Fetching personal portfolio KPI data', { requestId });
    
    // Get Personal Portfolio KPI data using sheetsAdapter method
    const kpiData = await sheetsAdapter.getPersonalPortfolioKpiData();

    logger.info('Personal portfolio KPI data fetched successfully', { 
      requestId, 
      totalAUM: kpiData.totalAUM 
    });

    return NextResponse.json({
      success: true,
      data: kpiData
    });

  } catch (error) {
    logger.error('Error fetching personal portfolio KPI data', error instanceof Error ? error : new Error('Unknown error'), { 
      requestId
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch personal portfolio KPI data'
    }, { status: 500 });
  }
}
