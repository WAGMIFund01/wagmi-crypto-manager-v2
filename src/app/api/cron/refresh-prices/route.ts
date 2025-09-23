import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    console.log('🔄 Vercel Cron: Starting automatic price refresh...');
    
    // Step 1: Update KPI timestamp
    console.log('📝 Vercel Cron: Updating KPI timestamp...');
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://wagmi-crypto-manager-v2.vercel.app';
    const timestampUpdateResponse = await fetch(`${baseUrl}/api/update-kpi-timestamp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!timestampUpdateResponse.ok) {
      throw new Error('Failed to update KPI timestamp');
    }
    
    // Step 2: Update prices from CoinGecko
    console.log('💰 Vercel Cron: Updating prices from CoinGecko...');
    const priceUpdateResponse = await fetch(`${baseUrl}/api/update-all-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!priceUpdateResponse.ok) {
      throw new Error('Failed to update prices');
    }
    
    // Step 3: Revalidate the dashboard page to force fresh data fetch
    console.log('🔄 Vercel Cron: Revalidating dashboard...');
    revalidatePath('/dashboard');
    
    console.log('✅ Vercel Cron: Price refresh completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Prices refreshed successfully via Vercel Cron',
      timestamp: new Date().toISOString(),
      method: 'vercel-cron',
      steps: {
        timestampUpdated: timestampUpdateResponse.ok,
        pricesUpdated: priceUpdateResponse.ok,
        dashboardRevalidated: true
      }
    });
    
  } catch (error) {
    console.error('❌ Vercel Cron: Error during price refresh:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      method: 'vercel-cron'
    }, { status: 500 });
  }
}

// Also support POST for manual triggers
export async function POST() {
  return GET();
}
