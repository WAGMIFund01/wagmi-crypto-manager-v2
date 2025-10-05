import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function POST() {
  try {
    // Generate current timestamp
    const timestamp = new Date().toISOString();
    
    // Use new SheetsAdapter method
    await sheetsAdapter.updateKpiTimestamp(timestamp, true); // true = Personal Portfolio

    return NextResponse.json({
      success: true,
      message: 'Personal Portfolio timestamp updated successfully using SheetsAdapter',
      timestamp: timestamp,
      source: 'SheetsAdapter.updateKpiTimestamp(timestamp, true)'
    });

  } catch (error) {
    console.error('Error updating Personal Portfolio timestamp:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
