import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function POST(request: NextRequest) {
  try {
    // Use new SheetsAdapter method
    await sheetsAdapter.updateKpiTimestamp(true); // true = Personal Portfolio

    return NextResponse.json({
      success: true,
      message: 'Personal Portfolio timestamp updated successfully using SheetsAdapter',
      timestamp: new Date().toISOString(),
      source: 'SheetsAdapter.updateKpiTimestamp(true)'
    });

  } catch (error) {
    console.error('Error updating Personal Portfolio timestamp:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
