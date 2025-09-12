import { NextResponse } from 'next/server';
import { fetchKPIData } from '@/lib/kpi-data';

export async function GET() {
  try {
    console.log('🔍 DEBUG - /api/kpi-data endpoint called');
    const kpiData = await fetchKPIData();
    console.log('🔍 DEBUG - fetchKPIData returned:', kpiData);
    
    if (!kpiData) {
      console.log('🔍 DEBUG - kpiData is null/undefined');
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch KPI data'
      }, { status: 500 });
    }

    console.log('🔍 DEBUG - Returning KPI data with lastUpdated:', kpiData.lastUpdated);
    return NextResponse.json({
      success: true,
      ...kpiData
    });

  } catch (error) {
    console.error('KPI data API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
