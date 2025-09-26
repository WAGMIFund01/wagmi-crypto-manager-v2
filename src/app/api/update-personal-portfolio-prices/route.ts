import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Personal Portfolio price update...');

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID || '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

    if (!serviceAccountEmail || !privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Google Sheets API credentials'
      }, { status: 503 });
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

    // Step 1: Read current Personal Portfolio data including CoinGecko ID column
    const portfolioResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Personal portfolio!A:M', // Include all columns A-M
    });

    const rows = portfolioResponse.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'No data found in Personal portfolio sheet'
      }, { status: 404 });
    }

    console.log(`Found ${rows.length - 1} assets in Personal Portfolio`);

    // Step 2: Process each asset and collect detailed information
    const assetDetails: {
      symbol: string;
      rowIndex: number;
      coinGeckoId: string | null;
      status: 'success' | 'no_coinGecko_id' | 'invalid_coinGecko_id' | 'coinGecko_error';
      error?: string;
      newPrice?: number;
      priceChange24h?: number;
    }[] = [];

    const coinGeckoIdsToFetch = new Set<string>();

    // Process each row (skip header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const symbol = row[1]?.toString().toUpperCase(); // Column B
      const coinGeckoId = row[10]?.toString()?.trim(); // Column K (0-indexed = 10)
      
      const assetDetail: {
        symbol: string;
        rowIndex: number;
        coinGeckoId: string | null;
        status: 'success' | 'no_coinGecko_id' | 'invalid_coinGecko_id' | 'coinGecko_error';
        error?: string;
        newPrice?: number;
        priceChange24h?: number;
      } = {
        symbol: symbol || 'UNKNOWN',
        rowIndex: i,
        coinGeckoId: coinGeckoId || null,
        status: 'success'
      };

      if (coinGeckoId) {
        coinGeckoIdsToFetch.add(coinGeckoId);
      } else {
        assetDetail.status = 'no_coinGecko_id';
        assetDetail.error = 'No CoinGecko ID found';
      }

      assetDetails.push(assetDetail);
    }

    console.log(`Found ${coinGeckoIdsToFetch.size} unique CoinGecko IDs to fetch`);

    // Fetch prices from CoinGecko API
    const coinGeckoPrices: { [key: string]: { price: number; priceChange24h: number } } = {};
    
    if (coinGeckoIdsToFetch.size > 0) {
      try {
        const coinGeckoIdsArray = Array.from(coinGeckoIdsToFetch);
        const coinGeckoResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIdsArray.join(',')}&vs_currencies=usd&include_24hr_change=true`
        );

        if (coinGeckoResponse.ok) {
          const coinGeckoData = await coinGeckoResponse.json();
          
          for (const [coinGeckoId, data] of Object.entries(coinGeckoData)) {
            if (data && typeof data === 'object' && 'usd' in data) {
              coinGeckoPrices[coinGeckoId] = {
                price: (data as any).usd,
                priceChange24h: (data as any).usd_24h_change || 0
              };
            }
          }
          
          console.log(`Successfully fetched prices for ${Object.keys(coinGeckoPrices).length} assets from CoinGecko`);
        } else {
          throw new Error(`CoinGecko API error: ${coinGeckoResponse.status}`);
        }
      } catch (error) {
        console.error('Error fetching prices from CoinGecko:', error);
        return NextResponse.json({
          success: false,
          error: `Failed to fetch prices from CoinGecko: ${error instanceof Error ? error.message : 'Unknown error'}`
        }, { status: 500 });
      }
    }

    // Update asset details with fetched prices
    for (const assetDetail of assetDetails) {
      if (assetDetail.coinGeckoId && coinGeckoPrices[assetDetail.coinGeckoId]) {
        const priceData = coinGeckoPrices[assetDetail.coinGeckoId];
        assetDetail.newPrice = priceData.price;
        assetDetail.priceChange24h = priceData.priceChange24h;
      } else if (assetDetail.coinGeckoId) {
        assetDetail.status = 'coinGecko_error';
        assetDetail.error = 'Price not found in CoinGecko response';
      }
    }

    // Update prices in Personal Portfolio sheet using batch update
    const updateResults = [];
    const batchUpdates = [];

    for (const assetDetail of assetDetails) {
      if (assetDetail.newPrice !== undefined) {
        const rowIndex = assetDetail.rowIndex + 1; // +1 because Google Sheets is 1-indexed
        
        // Update current price (Column H)
        batchUpdates.push({
          range: `Personal portfolio!H${rowIndex}:H${rowIndex}`,
          values: [[assetDetail.newPrice]]
        });
        
        // Update 24hr price change (Column L)
        batchUpdates.push({
          range: `Personal portfolio!L${rowIndex}:L${rowIndex}`,
          values: [[assetDetail.priceChange24h || 0]]
        });
        
        updateResults.push({
          symbol: assetDetail.symbol,
          success: true,
          newPrice: assetDetail.newPrice,
          priceChange24h: assetDetail.priceChange24h || 0
        });
        
        console.log(`Prepared update for ${assetDetail.symbol}: $${assetDetail.newPrice} (${assetDetail.priceChange24h?.toFixed(2)}%)`);
      }
    }

    // Execute batch update if we have updates to make
    if (batchUpdates.length > 0) {
      try {
        const batchUpdateResponse = await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: batchUpdates
          }
        });
        
        console.log(`Successfully updated ${batchUpdates.length / 2} assets in Personal Portfolio`);
      } catch (error) {
        console.error('Error updating Personal Portfolio prices:', error);
        return NextResponse.json({
          success: false,
          error: `Failed to update Personal Portfolio prices: ${error instanceof Error ? error.message : 'Unknown error'}`
        }, { status: 500 });
      }
    }

    const successfulUpdates = updateResults.filter(r => r.success).length;
    const failedUpdates = updateResults.filter(r => !r.success).length;

    console.log(`Personal Portfolio price update completed: ${successfulUpdates} successful, ${failedUpdates} failed`);

    return NextResponse.json({
      success: true,
      message: `Updated prices for ${successfulUpdates} assets`,
      details: {
        totalAssets: rows.length - 1, // -1 for header row
        successfulUpdates,
        failedUpdates,
        updateResults
      }
    });

  } catch (error) {
    console.error('Error updating Personal Portfolio prices:', error);
    return NextResponse.json({
      success: false,
      error: `Failed to update Personal Portfolio prices: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
