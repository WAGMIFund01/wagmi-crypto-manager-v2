import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function GET() {
  try {
    // Use new SheetsAdapter method
    const timestamp = await sheetsAdapter.getWagmiTimestamp();

    return NextResponse.json({
      success: true,
      timestamp: timestamp,
      timestampType: typeof timestamp,
      source: 'SheetsAdapter.getWagmiTimestamp()'
    });

  } catch (error) {
    console.error('Error getting last updated timestamp:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// POST endpoint for testing
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Get last updated timestamp API endpoint',
    description: 'This endpoint fetches the timestamp from cell B7 of the KPIs tab',
    usage: 'GET this endpoint to retrieve the last updated timestamp'
  });
}
