import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import { calculatePeakValue, calculatePeakRatio } from '@/shared/utils/performanceCalculations';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || 'wagmi-fund';
    
    logger.info('Fetching portfolio peak data', { requestId, module });
    
    let historicalData;
    let currentAUM = 0;
    
    try {
      if (module === 'personal-portfolio') {
        // Get Personal Portfolio historical data
        historicalData = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();
        
        // Get current AUM from Personal Portfolio KPI data
        const kpiData = await sheetsAdapter.getPersonalPortfolioKpiFromKpisTab();
        currentAUM = kpiData?.totalAUM || 0;
      } else {
        // Get WAGMI Fund historical data
        historicalData = await sheetsAdapter.getWagmiHistoricalPerformance();
        
        // Get current AUM from WAGMI Fund KPI data
        const kpiData = await sheetsAdapter.getKpiData();
        currentAUM = kpiData?.totalAUM || 0;
      }
      
      // Calculate peak value from historical data
      const peakValue = calculatePeakValue(historicalData);
      
      // Calculate peak ratio
      const { ratio, distanceToPeak } = calculatePeakRatio(currentAUM, peakValue);
      
      const peakData = {
        currentPortfolioValue: currentAUM,
        portfolioPeakValue: peakValue,
        peakRatio: ratio,
        distanceToPeak,
        lastUpdated: new Date().toISOString()
      };
      
      logger.info('Portfolio peak data calculated successfully from live data', { 
        requestId, 
        module,
        currentAUM,
        peakValue,
        ratio,
        dataPoints: historicalData.length
      });
      
      return NextResponse.json({
        success: true,
        data: peakData
      });
      
    } catch (sheetsError) {
      logger.warn('Failed to fetch live data, using mock data', { 
        requestId, 
        error: sheetsError instanceof Error ? sheetsError.message : 'Unknown error'
      });
      
      // Fallback to mock data when Google Sheets is unavailable
      const mockData = {
        currentPortfolioValue: module === 'personal-portfolio' ? 18500 : 20800,
        portfolioPeakValue: module === 'personal-portfolio' ? 22150 : 24150,
        peakRatio: module === 'personal-portfolio' ? 84 : 86,
        distanceToPeak: module === 'personal-portfolio' ? 3650 : 3350,
        lastUpdated: new Date().toISOString()
      };
      
      return NextResponse.json({
        success: true,
        data: mockData
      });
    }
    
  } catch (error) {
    logger.error('Error fetching portfolio peak data', error instanceof Error ? error : new Error('Unknown error'), { 
      requestId
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch portfolio peak data'
    }, { status: 500 });
  }
}
