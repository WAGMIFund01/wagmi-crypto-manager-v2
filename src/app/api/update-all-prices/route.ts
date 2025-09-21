import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
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

    // Step 1: Read current portfolio data including CoinGecko ID column
    const portfolioResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Portfolio Overview!A:L', // Extended to include columns K (CoinGecko ID) and L (24hr price change)
    });

    const rows = portfolioResponse.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'No data found in Portfolio Overview sheet'
      }, { status: 404 });
    }

    // Step 2: Process each asset and collect detailed information
    const assetDetails: {
      symbol: string;
      rowIndex: number;
      quantity: number;
      coinGeckoId: string | null;
      status: 'success' | 'no_quantity' | 'no_coinGecko_id' | 'invalid_coinGecko_id' | 'coinGecko_error';
      error?: string;
      newPrice?: number;
    }[] = [];

    const coinGeckoIdsToFetch = new Set<string>();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const symbol = row[1]?.toString().toUpperCase();
      const quantity = parseFloat(row[6]?.toString()) || 0;
      const coinGeckoId = row[10]?.toString()?.trim(); // Column K (0-indexed = 10)

      const assetDetail: {
        symbol: string;
        rowIndex: number;
        quantity: number;
        coinGeckoId: string | null;
        status: 'success' | 'no_quantity' | 'no_coinGecko_id' | 'invalid_coinGecko_id' | 'coinGecko_error';
        error?: string;
        newPrice?: number;
      } = {
        symbol: symbol || 'UNKNOWN',
        rowIndex: i,
        quantity,
        coinGeckoId: coinGeckoId || null,
        status: 'success'
      };

      // Check if asset has quantity > 0
      if (!symbol || quantity <= 0) {
        assetDetail.status = 'no_quantity';
        assetDetail.error = `No quantity (${quantity}) or invalid symbol (${symbol})`;
        assetDetails.push(assetDetail);
        continue;
      }

      // Check if CoinGecko ID is provided
      if (!coinGeckoId) {
        assetDetail.status = 'no_coinGecko_id';
        assetDetail.error = 'No CoinGecko ID provided in column K';
        assetDetails.push(assetDetail);
        continue;
      }

      // Validate CoinGecko ID format (basic check)
      if (coinGeckoId.length < 2 || coinGeckoId.includes(' ')) {
        assetDetail.status = 'invalid_coinGecko_id';
        assetDetail.error = `Invalid CoinGecko ID format: "${coinGeckoId}"`;
        assetDetails.push(assetDetail);
        continue;
      }

      // Add to fetch list
      coinGeckoIdsToFetch.add(coinGeckoId);
      assetDetails.push(assetDetail);
    }

    // Step 3: Fetch prices from CoinGecko
    let priceData: Record<string, { usd: number; usd_24h_change?: number }> = {};
    let coinGeckoError: string | null = null;

    console.log(`CoinGecko IDs to fetch: ${coinGeckoIdsToFetch.size} unique IDs`);
    console.log('CoinGecko IDs:', Array.from(coinGeckoIdsToFetch));

    if (coinGeckoIdsToFetch.size > 0) {
      const coinGeckoIds = Array.from(coinGeckoIdsToFetch).join(',');
      const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds}&vs_currencies=usd&include_24hr_change=true`;
      
      console.log('CoinGecko API URL:', apiUrl);
      
      try {
        const priceResponse = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            ...(config.coinGeckoApiKey && { 'x-cg-demo-api-key': config.coinGeckoApiKey }),
          },
        });

        console.log('CoinGecko API response status:', priceResponse.status, priceResponse.statusText);

        if (!priceResponse.ok) {
          throw new Error(`CoinGecko API error: ${priceResponse.status} ${priceResponse.statusText}`);
        }

        priceData = await priceResponse.json();
        console.log('CoinGecko API response data:', priceData);
      } catch (error) {
        coinGeckoError = error instanceof Error ? error.message : 'Unknown CoinGecko API error';
        console.error('CoinGecko API error:', error);
      }
    } else {
      console.log('No CoinGecko IDs to fetch - all assets missing valid CoinGecko IDs');
    }

    // Step 4: Update asset details with price information
    const currentTimestamp = new Date().toISOString();
    const updates: { range: string; values: (string | number)[][] }[] = [];
    let updatedCount = 0;

    console.log('=== PRICE UPDATE DEBUG ===');
    console.log('Total assets to process:', assetDetails.length);
    console.log('CoinGecko price data received:', Object.keys(priceData).length, 'assets');
    console.log('CoinGecko error:', coinGeckoError);

    for (const asset of assetDetails) {
      console.log(`Processing asset: ${asset.symbol} (${asset.coinGeckoId}) - Status: ${asset.status}`);
      
      if (asset.status === 'success' && asset.coinGeckoId) {
        const priceInfo = priceData[asset.coinGeckoId];
        const newPrice = priceInfo?.usd;
        const newPriceChange = priceInfo?.usd_24h_change;

        console.log(`  Price info for ${asset.coinGeckoId}:`, priceInfo);
        console.log(`  New price: ${newPrice}, Price change: ${newPriceChange}`);

        if (newPrice !== undefined) {
          asset.newPrice = newPrice;
          const rowNum = asset.rowIndex + 1; // Google Sheets is 1-indexed
          const currentPriceRange = `Portfolio Overview!H${rowNum}`;
          const lastUpdateRange = `Portfolio Overview!J${rowNum}`;

          console.log(`  Adding update for row ${rowNum}:`);
          console.log(`    Current price (${currentPriceRange}): ${newPrice}`);
          console.log(`    Last update (${lastUpdateRange}): ${currentTimestamp}`);

          updates.push({
            range: currentPriceRange,
            values: [[newPrice]]
          });
          updates.push({
            range: lastUpdateRange,
            values: [[currentTimestamp]]
          });

          // Add 24hr price change update if available
          if (newPriceChange !== undefined) {
            const priceChangeRange = `Portfolio Overview!L${rowNum}`;
            console.log(`    24hr change (${priceChangeRange}): ${newPriceChange}`);
            updates.push({
              range: priceChangeRange,
              values: [[newPriceChange]]
            });
          }

          updatedCount++;
        } else {
          asset.status = 'coinGecko_error';
          asset.error = `No price data returned from CoinGecko for ID: ${asset.coinGeckoId}`;
          console.log(`  ERROR: No price data for ${asset.coinGeckoId}`);
        }
      } else {
        console.log(`  SKIPPED: Asset ${asset.symbol} - Status: ${asset.status}, CoinGecko ID: ${asset.coinGeckoId}`);
      }
    }

    // Step 5: Execute batch update if there are updates to make
    console.log(`Total updates to execute: ${updates.length}`);
    if (updates.length > 0) {
      console.log('Executing batch update to Google Sheets...');
      console.log('Updates:', updates.map(u => `${u.range}: ${u.values[0][0]}`));
      
      const batchUpdateResult = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      
      console.log('Batch update result:', batchUpdateResult.data);
    } else {
      console.log('No updates to execute - no valid price data found');
    }

    // Step 6: Return detailed results
    const summary = {
      totalAssets: assetDetails.length,
      updatedAssets: updatedCount,
      noQuantity: assetDetails.filter(a => a.status === 'no_quantity').length,
      noCoinGeckoId: assetDetails.filter(a => a.status === 'no_coinGecko_id').length,
      invalidCoinGeckoId: assetDetails.filter(a => a.status === 'invalid_coinGecko_id').length,
      coinGeckoErrors: assetDetails.filter(a => a.status === 'coinGecko_error').length,
    };

    return NextResponse.json({
      success: true,
      message: `Processed ${summary.totalAssets} assets, updated ${summary.updatedAssets} (prices and 24hr changes)`,
      summary,
      coinGeckoApiError: coinGeckoError,
      timestamp: currentTimestamp,
      assetDetails: assetDetails.map(asset => ({
        symbol: asset.symbol,
        quantity: asset.quantity,
        coinGeckoId: asset.coinGeckoId,
        status: asset.status,
        error: asset.error,
        newPrice: asset.newPrice,
        newPriceChange: asset.status === 'success' && asset.coinGeckoId 
          ? priceData[asset.coinGeckoId]?.usd_24h_change 
          : null,
      }))
    });

  } catch (error) {
    console.error('Price update error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Full price update endpoint - use POST to update all asset prices',
    usage: 'POST to this endpoint to update all supported asset prices from CoinGecko',
    note: 'This endpoint reads CoinGecko IDs from column K in your Google Sheet',
    features: [
      'Reads CoinGecko IDs from column K',
      'Provides detailed error reporting for each asset',
      'Updates prices in column H and timestamps in column J',
      'Supports any cryptocurrency with valid CoinGecko ID'
    ]
  });
}
