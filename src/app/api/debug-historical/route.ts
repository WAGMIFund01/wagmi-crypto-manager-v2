import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

/**
 * Debug endpoint for historical performance methods
 * Temporary debugging tool
 */

export async function GET() {
  try {
    console.log('🔍 Starting historical performance debug...');
    
    // Test WAGMI historical performance
    console.log('\n📊 Testing WAGMI Historical Performance...');
    const wagmiData = await sheetsAdapter.getWagmiHistoricalPerformance();
    console.log('WAGMI Result:', wagmiData);
    console.log('WAGMI Count:', wagmiData.length);
    
    // Test Personal Portfolio historical performance
    console.log('\n📊 Testing Personal Portfolio Historical Performance...');
    const personalData = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();
    console.log('Personal Result:', personalData);
    console.log('Personal Count:', personalData.length);
    
    // Test direct sheet reading using public method
    console.log('\n📊 Testing direct sheet reading...');
    try {
      const directResponse = await sheetsAdapter.getWagmiHistoricalPerformance();
      console.log('Direct sheet response rows:', directResponse?.length || 0);
      if (directResponse && directResponse.length > 0) {
        console.log('First row:', directResponse[0]);
        if (directResponse.length > 1) {
          console.log('Second row:', directResponse[1]);
        }
      }
    } catch (directError) {
      console.error('Direct sheet reading error:', directError);
    }
    
    return NextResponse.json({
      success: true,
      wagmiData,
      personalData,
      wagmiCount: wagmiData.length,
      personalCount: personalData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
