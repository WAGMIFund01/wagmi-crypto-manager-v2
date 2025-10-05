import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function GET() {
  try {
    // Use new SheetsAdapter method
    const timestamp = await sheetsAdapter.getPersonalPortfolioTimestamp();

    return NextResponse.json({
      success: true,
      timestamp: timestamp,
      timestampType: typeof timestamp,
      source: 'SheetsAdapter.getPersonalPortfolioTimestamp()'
    });

  } catch (error) {
    console.error('Error getting Personal Portfolio timestamp:', error);
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
    message: 'Get Personal Portfolio timestamp API endpoint',
    description: 'This endpoint fetches the timestamp from cell B9 of the KPIs tab',
    usage: 'GET this endpoint to retrieve the Personal Portfolio last updated timestamp'
  });
}
