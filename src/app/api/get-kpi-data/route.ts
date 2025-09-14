import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function GET() {
  try {
    // Use the unified SheetsAdapter to fetch KPI data
    const kpiData = await sheetsAdapter.getKpiData();

    return NextResponse.json({
      success: true,
      kpiData: kpiData
    });

  } catch (error: unknown) {
    console.error('Error fetching KPI data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during KPI data fetch',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
