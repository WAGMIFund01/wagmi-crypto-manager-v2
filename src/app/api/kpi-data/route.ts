import { NextResponse } from 'next/server';
import { fetchKPIData } from '@/lib/kpi-data';

export async function GET() {
  try {
    const kpiData = await fetchKPIData();
    
    if (!kpiData) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch KPI data'
      }, { status: 500 });
    }

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
