import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    // Get dataSource from request body
    const body = await request.json().catch(() => ({}));
    const dataSource = body.dataSource || 'wagmi-fund';
    
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
    const sheetRange = dataSource === 'personal-portfolio' 
      ? 'Personal portfolio!A:L' 
      : 'Portfolio Overview!A:L';
    
    const portfolioResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetRange, // Extended to include columns K (CoinGecko ID) and L (24hr price change)
    });

    const rows = portfolioResponse.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({
        success: false,
        error: `No data found in ${dataSource === 'personal-portfolio' ? 'Personal portfolio' : 'Portfolio Overview'} sheet`
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
      
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const priceResponse = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            ...(config.coinGeckoApiKey && { 'x-cg-demo-api-key': config.coinGeckoApiKey }),
          },
        });

        console.log('CoinGecko API response status:', priceResponse.status, priceResponse.statusText);

        if (!priceResponse.ok) {
          if (priceResponse.status === 429) {
            throw new Error('CoinGecko API rate limit exceeded. Please wait before trying again.');
          }
          throw new Error(`CoinGecko API error: ${priceResponse.status} ${priceResponse.statusText}`);
        }

        const responseData = await priceResponse.json();
        console.log('CoinGecko API response data:', responseData);
        
        // Check for rate limit error in response body
        if (responseData.status && responseData.status.error_code === 429) {
          throw new Error(`CoinGecko API rate limit exceeded: ${responseData.status.error_message}`);
        }
        
        // If no error, use the response data as price data
        priceData = responseData;
      } catch (error) {
        coinGeckoError = error instanceof Error ? error.message : 'Unknown CoinGecko API error';
        console.error('CoinGecko API error:', error);
        
        // If rate limited, return early with error
        if (coinGeckoError.includes('rate limit')) {
          return NextResponse.json({
            success: false,
            error: 'CoinGecko API rate limit exceeded',
            message: 'Price updates are temporarily unavailable due to API rate limits. Please try again later.',
            coinGeckoApiError: coinGeckoError,
            timestamp: new Date().toISOString()
          }, { status: 429 });
        }
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
          const sheetName = dataSource === 'personal-portfolio' ? 'Personal portfolio' : 'Portfolio Overview';
          const currentPriceRange = `${sheetName}!H${rowNum}`;
          const lastUpdateRange = `${sheetName}!J${rowNum}`;

          console.log(`  Adding update for row ${rowNum}:`);
          console.log(`    Current price (${currentPriceRange}): ${newPrice}`);
          console.log(`    Last update (${lastUpdateRange}): ${currentTimestamp}`);

          // Test: Try updating current price with different formats
          console.log(`    Testing different value formats for current price:`);
          console.log(`      - As number: ${newPrice}`);
          console.log(`      - As string: "${newPrice}"`);
          console.log(`      - As string with toString: ${newPrice.toString()}`);

          updates.push({
            range: currentPriceRange,
            values: [[newPrice.toString()]] // Try as string to see if that works
          });
          updates.push({
            range: lastUpdateRange,
            values: [[currentTimestamp]]
          });

          // Add 24hr price change update if available
          if (newPriceChange !== undefined) {
            const priceChangeRange = `${sheetName}!L${rowNum}`;
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
      
      // Try different valueInputOption to see if that fixes the current price issue
      const batchUpdateResult = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED', // Changed from 'RAW' to 'USER_ENTERED'
          data: updates
        }
      });
      
      console.log('Batch update result:', batchUpdateResult.data);
      
      // Step 5.5: Update Personal Portfolio timestamp in KPIs tab if dataSource is personal-portfolio
      if (dataSource === 'personal-portfolio') {
        console.log('Updating Personal Portfolio timestamp in KPIs tab...');
        try {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');
          
          const timestamp = `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
          
          await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: 'KPIs!B9', // Last Updated - personal
            valueInputOption: 'RAW',
            requestBody: {
              values: [[timestamp]]
            }
          });
          
          console.log('Personal Portfolio timestamp updated successfully:', timestamp);
        } catch (timestampError) {
          console.error('Failed to update Personal Portfolio timestamp:', timestampError);
          // Continue even if timestamp update fails
        }
      }
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
