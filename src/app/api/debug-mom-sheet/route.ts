import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

/**
 * Debug endpoint to read MoM performance sheet directly
 * Temporary debugging tool
 */

export async function GET() {
  try {
    console.log('🔍 Reading MoM performance sheet using public method...');
    
    // Use public method instead of direct access
    const momData = await sheetsAdapter.getWagmiHistoricalPerformance();
    
    console.log(`📊 DEBUG: Retrieved ${momData.length} processed rows from MoM performance sheet`);
    
    if (momData.length > 0) {
      console.log(`📊 DEBUG: First row:`, momData[0]);
      if (momData.length > 1) {
        console.log(`📊 DEBUG: Second row:`, momData[1]);
      }
    }

    return NextResponse.json({
      success: true,
      data: momData,
      count: momData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug MoM sheet error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
