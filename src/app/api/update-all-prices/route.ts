import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

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
      range: 'Portfolio Overview!A:K', // Extended to include column K for CoinGecko ID
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

    // Generate current timestamp in a Google Sheets-friendly format
    const now = new Date();
    const currentTimestamp = now.toISOString(); // Keep ISO format for Portfolio Overview
    const kpiTimestamp = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }); // Use a simpler format for KPI tab

    // Step 3: Process each row (skip header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const symbol = row[1]; // Column B - Symbol
      const quantity = parseFloat(row[6]); // Column G - Quantity
      const coinGeckoId = row[10]; // Column K - CoinGecko ID

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

      // Validate quantity
      if (!quantity || isNaN(quantity) || quantity <= 0) {
        assetDetail.status = 'no_quantity';
        assetDetails.push(assetDetail);
        continue;
      }

      // Validate CoinGecko ID
      if (!coinGeckoId || coinGeckoId.trim() === '') {
        assetDetail.status = 'no_coinGecko_id';
        assetDetails.push(assetDetail);
        continue;
      }

      assetDetails.push(assetDetail);
    }

    // Step 4: Fetch prices from CoinGecko and prepare updates
    const updates: any[] = [];
    let updatedCount = 0;
    let coinGeckoError = null;

    // Process assets in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < assetDetails.length; i += batchSize) {
      const batch = assetDetails.slice(i, i + batchSize);
      const coinGeckoIds = batch
        .filter(asset => asset.status === 'success')
        .map(asset => asset.coinGeckoId)
        .join(',');

      if (coinGeckoIds) {
        try {
          const coinGeckoResponse = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds}&vs_currencies=usd`,
            {
              headers: {
                'Accept': 'application/json',
              },
            }
          );

          if (!coinGeckoResponse.ok) {
            coinGeckoError = `CoinGecko API error: ${coinGeckoResponse.status}`;
            // Mark all assets in this batch as having CoinGecko errors
            batch.forEach(asset => {
              if (asset.status === 'success') {
                asset.status = 'coinGecko_error';
                asset.error = coinGeckoError;
              }
            });
            continue;
          }

          const priceData = await coinGeckoResponse.json();

          // Process each asset in the batch
          for (const asset of batch) {
            if (asset.status !== 'success') continue;

            const price = priceData[asset.coinGeckoId!]?.usd;
            if (price && typeof price === 'number') {
              asset.newPrice = price;
              asset.status = 'success';

              // Prepare update for current price (Column H)
              const priceRange = `Portfolio Overview!H${asset.rowIndex + 1}`;
              // Prepare update for last price update timestamp (Column J)
              const lastUpdateRange = `Portfolio Overview!J${asset.rowIndex + 1}`;

              updates.push({
                range: priceRange,
                values: [[price]]
              });
              updates.push({
                range: lastUpdateRange,
                values: [[currentTimestamp]]
              });
              updatedCount++;
            } else {
              asset.status = 'coinGecko_error';
              asset.error = `No price data returned from CoinGecko for ID: ${asset.coinGeckoId}`;
            }
          }
        } catch (error) {
          coinGeckoError = `CoinGecko API error: ${error}`;
          // Mark all assets in this batch as having CoinGecko errors
          batch.forEach(asset => {
            if (asset.status === 'success') {
              asset.status = 'coinGecko_error';
              asset.error = coinGeckoError;
            }
          });
        }
      }
    }

    // Add KPI timestamp update to the batch (using simpler format)
    updates.push({
      range: 'KPIs!B7',
      values: [[kpiTimestamp]]
    });

    // Step 5: Execute batch update if there are updates to make
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      console.log('Updated KPI tab timestamp:', kpiTimestamp);
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
      message: `Processed ${summary.totalAssets} assets, updated ${summary.updatedAssets}`,
      summary,
      coinGeckoApiError: coinGeckoError,
      timestamp: currentTimestamp,
      kpiTimestamp: kpiTimestamp,
      assetDetails: assetDetails.map(asset => ({
        symbol: asset.symbol,
        quantity: asset.quantity,
        coinGeckoId: asset.coinGeckoId,
        status: asset.status,
        error: asset.error,
        newPrice: asset.newPrice
      }))
    });

  } catch (error) {
    console.error('Error in update-all-prices:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Price update API endpoint',
    description: 'This endpoint updates cryptocurrency prices in the Portfolio Overview sheet and timestamps in both Portfolio Overview and KPI tabs.',
    features: [
      'Reads CoinGecko IDs from Column K in Portfolio Overview sheet',
      'Fetches live prices from CoinGecko API',
      'Updates current prices in Column H',
      'Updates last price update timestamps in Column J',
      'Updates KPI tab timestamp in cell B7 with simplified format',
      'Provides detailed error reporting for each asset',
      'Handles missing quantities, CoinGecko IDs, and API errors gracefully'
    ],
    usage: 'POST to this endpoint to trigger price updates'
  });
}