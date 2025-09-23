import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { google } from 'googleapis';

export async function GET() {
  try {
    console.log('🔄 Vercel Cron: Starting automatic price refresh...');
    
    // Step 1: Update KPI timestamp (inline implementation)
    console.log('📝 Vercel Cron: Updating KPI timestamp...');
    try {
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;
      const sheetId = process.env.GOOGLE_SHEET_ID || '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

      if (!serviceAccountEmail || !privateKey) {
        throw new Error('Missing Google Sheets API credentials');
      }

      // Create authentication
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccountEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      // Generate current timestamp
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      const timestamp = `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
      
      console.log('Generated timestamp:', timestamp);

      // Update the KPI tab timestamp (cell B7)
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'KPIs!B7',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[timestamp]]
        }
      });

      console.log('✅ KPI timestamp updated successfully');
    } catch (timestampError) {
      console.error('❌ Failed to update KPI timestamp:', timestampError);
      // Continue with other steps even if timestamp fails
    }
    
    // Step 2: Update prices from CoinGecko (call external API)
    console.log('💰 Vercel Cron: Updating prices from CoinGecko...');
    try {
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://wagmi-crypto-manager-v2.vercel.app';
      const priceUpdateResponse = await fetch(`${baseUrl}/api/update-all-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!priceUpdateResponse.ok) {
        throw new Error('Failed to update prices');
      }
      
      console.log('✅ Prices updated successfully');
    } catch (priceError) {
      console.error('❌ Failed to update prices:', priceError);
      // Continue with revalidation even if price update fails
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
        timestampUpdated: true,
        pricesUpdated: true,
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
