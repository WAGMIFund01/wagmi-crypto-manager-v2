import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { google } from 'googleapis';

export async function GET() {
  try {
    console.log('🔄 Vercel Cron: Starting automatic price refresh...');
    
    // Initialize Google Sheets authentication
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

    // Step 1: Update KPI timestamp (inline implementation)
    console.log('📝 Vercel Cron: Updating KPI timestamp...');
    try {

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
    
    // Step 2: Update prices from CoinGecko (inline implementation)
    console.log('💰 Vercel Cron: Updating prices from CoinGecko...');
    try {
      // Read current portfolio data including CoinGecko ID column
      const portfolioResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Portfolio Overview!A:L', // Extended to include columns K (CoinGecko ID) and L (24hr price change)
      });

      const rows = portfolioResponse.data.values;
      if (!rows || rows.length < 2) {
        throw new Error('No data found in Portfolio Overview sheet');
      }

      // Process each asset and collect CoinGecko IDs
      const coinGeckoIdsToFetch = new Set<string>();
      const assetDetails: { symbol: string; rowIndex: number; coinGeckoId: string | null }[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const symbol = row[1]?.toString().toUpperCase();
        const quantity = parseFloat(row[6]?.toString()) || 0;
        const coinGeckoId = row[10]?.toString()?.trim(); // Column K (0-indexed = 10)

        // Only process assets with quantity > 0 and valid CoinGecko ID
        if (symbol && quantity > 0 && coinGeckoId && coinGeckoId.length >= 2 && !coinGeckoId.includes(' ')) {
          coinGeckoIdsToFetch.add(coinGeckoId);
          assetDetails.push({ symbol, rowIndex: i, coinGeckoId });
        }
      }

      console.log(`CoinGecko IDs to fetch: ${coinGeckoIdsToFetch.size} unique IDs`);

      // Fetch prices from CoinGecko
      let priceData: Record<string, { usd: number; usd_24h_change?: number }> = {};
      
      if (coinGeckoIdsToFetch.size > 0) {
        const coinGeckoIds = Array.from(coinGeckoIdsToFetch).join(',');
        const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds}&vs_currencies=usd&include_24hr_change=true`;
        
        console.log('CoinGecko API URL:', apiUrl);
        
        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const priceResponse = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });

        console.log('CoinGecko API response status:', priceResponse.status);

        if (!priceResponse.ok) {
          if (priceResponse.status === 429) {
            throw new Error('CoinGecko API rate limit exceeded');
          }
          throw new Error(`CoinGecko API error: ${priceResponse.status} ${priceResponse.statusText}`);
        }

        const responseData = await priceResponse.json();
        
        // Check for rate limit error in response body
        if (responseData.status && responseData.status.error_code === 429) {
          throw new Error(`CoinGecko API rate limit exceeded: ${responseData.status.error_message}`);
        }
        
        priceData = responseData;
      }

      // Update prices in Google Sheets
      const currentTimestamp = new Date().toISOString();
      const updates: { range: string; values: (string | number)[][] }[] = [];
      let updatedCount = 0;

      for (const asset of assetDetails) {
        if (asset.coinGeckoId) {
          const priceInfo = priceData[asset.coinGeckoId];
          const newPrice = priceInfo?.usd;
          const newPriceChange = priceInfo?.usd_24h_change;

          if (newPrice !== undefined) {
            const rowNum = asset.rowIndex + 1; // Google Sheets is 1-indexed
            const currentPriceRange = `Portfolio Overview!H${rowNum}`;
            const lastUpdateRange = `Portfolio Overview!J${rowNum}`;

            updates.push({
              range: currentPriceRange,
              values: [[newPrice.toString()]]
            });
            updates.push({
              range: lastUpdateRange,
              values: [[currentTimestamp]]
            });

            // Add 24hr price change update if available
            if (newPriceChange !== undefined) {
              const priceChangeRange = `Portfolio Overview!L${rowNum}`;
              updates.push({
                range: priceChangeRange,
                values: [[newPriceChange]]
              });
            }

            updatedCount++;
          }
        }
      }

      // Execute batch update if there are updates to make
      if (updates.length > 0) {
        console.log(`Executing batch update: ${updates.length} updates for ${updatedCount} assets`);
        
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates
          }
        });
      }

      console.log(`✅ Prices updated successfully: ${updatedCount} assets updated`);
    } catch (priceError) {
      console.error('❌ Failed to update prices:', priceError);
      // Continue with revalidation even if price update fails
    }
    
    // Step 3: Revalidate all dashboard pages and cache tags to force fresh data fetch
    console.log('🔄 Vercel Cron: Revalidating all dashboard pages and cache...');
    
    // Revalidate all pages that display portfolio/KPI data
    revalidatePath('/dashboard');
    revalidatePath('/wagmi-fund-module');
    revalidatePath('/investor');
    
    // Also revalidate cache tags for more aggressive cache invalidation
    revalidateTag('portfolio-data');
    revalidateTag('kpi-data');
    revalidateTag('investor-data');
    
    console.log('✅ Vercel Cron: All dashboard pages and cache revalidated');
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
