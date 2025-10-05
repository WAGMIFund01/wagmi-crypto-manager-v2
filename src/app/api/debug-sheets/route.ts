import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

/**
 * Debug endpoint to list all sheets
 * Temporary debugging tool
 */

export async function GET() {
  try {
    console.log('🔍 Testing SheetsAdapter methods...');
    
    // Test various public methods
    const wagmiData = await sheetsAdapter.getWagmiHistoricalPerformance();
    const personalData = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();
    const kpiData = await sheetsAdapter.getKpiData();
    
    console.log('WAGMI data count:', wagmiData.length);
    console.log('Personal data count:', personalData.length);
    console.log('KPI data:', kpiData);

    return NextResponse.json({
      success: true,
      wagmiDataCount: wagmiData.length,
      personalDataCount: personalData.length,
      kpiData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug sheets error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
