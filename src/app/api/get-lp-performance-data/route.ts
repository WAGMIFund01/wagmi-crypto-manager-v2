import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import { calculateLPMetrics } from '@/shared/utils/performanceCalculations';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    const { searchParams } = new URL(request.url);
    const selectedModule = searchParams.get('module') || 'wagmi-fund';
    
    logger.info('Fetching LP performance data', { requestId, module: selectedModule });
    
    try {
      let lpData;
      
      if (selectedModule === 'personal-portfolio') {
        // Get Personal Portfolio LP data
        lpData = await sheetsAdapter.getPersonalPortfolioLPData();
      } else {
        // Get WAGMI Fund LP data
        lpData = await sheetsAdapter.getLPData();
      }
      
      // Calculate additional metrics
      const metrics = calculateLPMetrics(
        lpData.initialDeposit,
        lpData.currentValue,
        lpData.yieldGenerated,
        lpData.currentValue - lpData.opportunityCost // Calculate spot value from opportunity cost
      );
      
      const performanceData = {
        initialDeposit: lpData.initialDeposit,
        currentValue: lpData.currentValue,
        yieldGenerated: lpData.yieldGenerated,
        spotValue: lpData.currentValue - lpData.opportunityCost,
        capitalAppreciation: metrics.capitalAppreciation,
        totalReturn: metrics.totalReturn,
        roi: metrics.roi,
        oppCostDelta: metrics.oppCostDelta,
        oppCostRatio: metrics.oppCostRatio,
        lastUpdated: new Date().toISOString()
      };
      
      logger.info('LP performance data calculated successfully from live data', { 
        requestId, 
        module: selectedModule,
        initialDeposit: lpData.initialDeposit,
        currentValue: lpData.currentValue,
        roi: metrics.roi
      });
      
      return NextResponse.json({
        success: true,
        data: performanceData
      });
      
    } catch (sheetsError) {
      logger.warn('Failed to fetch live LP data, using mock data', { 
        requestId, 
        error: sheetsError instanceof Error ? sheetsError.message : 'Unknown error'
      });
      
      // Fallback to mock data when Google Sheets is unavailable
      const mockData = {
        initialDeposit: selectedModule === 'personal-portfolio' ? 8500 : 10000,
        currentValue: selectedModule === 'personal-portfolio' ? 10250 : 12450,
        yieldGenerated: selectedModule === 'personal-portfolio' ? 450 : 780,
        spotValue: selectedModule === 'personal-portfolio' ? 10800 : 13100,
        capitalAppreciation: selectedModule === 'personal-portfolio' ? 1750 : 2450,
        totalReturn: selectedModule === 'personal-portfolio' ? 2200 : 3230,
        roi: selectedModule === 'personal-portfolio' ? 26 : 32,
        oppCostDelta: selectedModule === 'personal-portfolio' ? -550 : -650,
        oppCostRatio: selectedModule === 'personal-portfolio' ? 95 : 95,
        lastUpdated: new Date().toISOString()
      };
      
      return NextResponse.json({
        success: true,
        data: mockData
      });
    }
    
  } catch (error) {
    logger.error('Error fetching LP performance data', error instanceof Error ? error : new Error('Unknown error'), { 
      requestId
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch LP performance data'
    }, { status: 500 });
  }
}
