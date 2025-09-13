import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { config } from '@/lib/config';

export async function POST() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID || '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

    if (!serviceAccountEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Google Sheets credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Step 1: Read current portfolio data including CoinGecko ID column
    console.log('Reading portfolio data for price change updates...');
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Portfolio Overview!A:L', // Extended to include column L for 24hr price change
    });

    const rows = readResponse.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json(
        { error: 'No data found in Portfolio Overview sheet' },
        { status: 404 }
      );
    }

    // Step 2: Process data and collect CoinGecko IDs
    const dataRows = rows.slice(1);
    
    interface AssetDetail {
      rowIndex: number;
      assetName: string;
      symbol: string;
      coinGeckoId: string | null;
      currentPriceChange: number | null;
      status: 'success' | 'no_coinGecko_id' | 'invalid_coinGecko_id' | 'coinGecko_error';
      error?: string;
    }

    const assetDetails: AssetDetail[] = [];
    const coinGeckoIdsToFetch = new Set<string>();

    dataRows.forEach((row, index) => {
      const assetName = row[0]?.toString()?.trim() || '';
      const symbol = row[1]?.toString()?.trim() || '';
      const coinGeckoId = row[10]?.toString()?.trim(); // Column K (0-indexed = 10)
      const currentPriceChange = row[11] ? parseFloat(row[11].toString()) : null; // Column L (0-indexed = 11)

      const assetDetail: AssetDetail = {
        rowIndex: index + 2, // +2 because we skip header and 0-indexed
        assetName,
        symbol,
        coinGeckoId: coinGeckoId || null,
        currentPriceChange,
        status: 'success',
      };

      // Check if CoinGecko ID is provided
      if (!coinGeckoId) {
        assetDetail.status = 'no_coinGecko_id';
        assetDetail.error = 'No CoinGecko ID provided in column K';
        assetDetails.push(assetDetail);
        return;
      }

      // Validate CoinGecko ID format (basic check)
      if (coinGeckoId.length < 2 || coinGeckoId.includes(' ')) {
        assetDetail.status = 'invalid_coinGecko_id';
        assetDetail.error = `Invalid CoinGecko ID format: "${coinGeckoId}"`;
        assetDetails.push(assetDetail);
        return;
      }

      // Add to fetch list
      coinGeckoIdsToFetch.add(coinGeckoId);
      assetDetails.push(assetDetail);
    });

    // Step 3: Fetch 24hr price changes from CoinGecko
    console.log(`Fetching 24hr price changes for ${coinGeckoIdsToFetch.size} assets...`);
    let coinGeckoError: string | null = null;
    let priceChangeData: Record<string, { usd_24h_change: number }> = {};

    if (coinGeckoIdsToFetch.size > 0) {
      const coinGeckoIds = Array.from(coinGeckoIdsToFetch).join(',');
      
      try {
        const priceChangeResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds}&vs_currencies=usd&include_24hr_change=true`,
          {
            headers: {
              'Accept': 'application/json',
              ...(config.coinGeckoApiKey && { 'x-cg-demo-api-key': config.coinGeckoApiKey }),
            },
          }
        );

        if (!priceChangeResponse.ok) {
          throw new Error(`CoinGecko API error: ${priceChangeResponse.status} ${priceChangeResponse.statusText}`);
        }

        priceChangeData = await priceChangeResponse.json();
      } catch (error) {
        coinGeckoError = error instanceof Error ? error.message : 'Unknown CoinGecko API error';
      }
    }

    // Step 4: Update Google Sheets with new price change data
    console.log('Updating Google Sheets with 24hr price changes...');
    const updatePromises: Promise<unknown>[] = [];

    for (const asset of assetDetails) {
      if (asset.status === 'success' && asset.coinGeckoId) {
        const priceChangeInfo = priceChangeData[asset.coinGeckoId];
        
        if (priceChangeInfo && typeof priceChangeInfo.usd_24h_change === 'number') {
          const newPriceChange = priceChangeInfo.usd_24h_change;
          
          // Only update if the value has changed (to avoid unnecessary API calls)
          if (asset.currentPriceChange !== newPriceChange) {
            const updatePromise = sheets.spreadsheets.values.update({
              spreadsheetId: sheetId,
              range: `Portfolio Overview!L${asset.rowIndex}`,
              valueInputOption: 'RAW',
              requestBody: {
                values: [[newPriceChange]],
              },
            });
            updatePromises.push(updatePromise);
          }
        } else {
          asset.status = 'coinGecko_error';
          asset.error = `No 24hr price change data returned from CoinGecko for ID: ${asset.coinGeckoId}`;
        }
      }
    }

    // Execute all updates in parallel
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // Step 5: Prepare response
    const summary = {
      totalAssets: assetDetails.length,
      updatedAssets: updatePromises.length,
      noCoinGeckoId: assetDetails.filter(a => a.status === 'no_coinGecko_id').length,
      invalidCoinGeckoId: assetDetails.filter(a => a.status === 'invalid_coinGecko_id').length,
      coinGeckoErrors: assetDetails.filter(a => a.status === 'coinGecko_error').length,
    };

    const response = {
      success: true,
      message: `Updated 24hr price changes for ${updatePromises.length} assets`,
      summary,
      coinGeckoApiError: coinGeckoError,
      timestamp: new Date().toISOString(),
      assetDetails: assetDetails.map(asset => ({
        assetName: asset.assetName,
        symbol: asset.symbol,
        coinGeckoId: asset.coinGeckoId,
        status: asset.status,
        error: asset.error,
        newPriceChange: asset.status === 'success' && asset.coinGeckoId 
          ? priceChangeData[asset.coinGeckoId]?.usd_24h_change 
          : null,
      })),
    };

    console.log('Price change update completed:', response.summary);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error updating price changes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update price changes',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/update-price-changes',
    method: 'POST',
    usage: 'POST to this endpoint to update 24hr price changes for all assets',
    note: 'This endpoint reads CoinGecko IDs from column K and updates column L with 24hr price change percentages',
    features: [
      'Reads CoinGecko IDs from column K',
      'Fetches 24hr price change data from CoinGecko API',
      'Updates column L with percentage changes',
      'Supports any cryptocurrency with valid CoinGecko ID',
      'Only updates values that have changed to optimize performance'
    ]
  });
}
