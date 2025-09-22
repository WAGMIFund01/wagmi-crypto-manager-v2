import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    console.log('🔄 Cron job: Starting automatic price refresh...');
    
    // Step 1: Revalidate the dashboard page to clear cache
    revalidatePath('/dashboard');
    console.log('✅ Cron job: Dashboard page revalidated');
    
    // Step 2: You could add additional price update logic here
    // For example, calling external APIs to update prices in your database
    // This is where you'd integrate with CoinGecko, CoinMarketCap, etc.
    
    const timestamp = new Date().toISOString();
    
    console.log(`✅ Cron job: Price refresh completed at ${timestamp}`);
    
    return NextResponse.json({
      success: true,
      message: 'Prices refreshed successfully',
      timestamp,
      method: 'cron-job'
    });
    
  } catch (error) {
    console.error('❌ Cron job: Error during price refresh:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh prices',
      timestamp: new Date().toISOString(),
      method: 'cron-job'
    }, { status: 500 });
  }
}

// Also support POST for manual triggers
export async function POST() {
  return GET();
}
