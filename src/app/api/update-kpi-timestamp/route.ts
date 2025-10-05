import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function POST(request: NextRequest) {
  try {
    // Use new SheetsAdapter method
    await sheetsAdapter.updateKpiTimestamp(false); // false = WAGMI Fund

    return NextResponse.json({
      success: true,
      message: 'KPI timestamp updated successfully using SheetsAdapter',
      timestamp: new Date().toISOString(),
      source: 'SheetsAdapter.updateKpiTimestamp(false)'
    });

  } catch (error) {
    console.error('Error updating KPI timestamp:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'KPI timestamp update API endpoint',
    description: 'This endpoint updates the timestamp in the KPI tab (cell B7)',
    usage: 'POST to this endpoint to trigger timestamp update'
  });
}
