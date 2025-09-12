import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Simple mapping for testing - we'll start with just AURA
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'AURA': 'aura-network',
  'ETH': 'ethereum',
  'SOL': 'solana'
};

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

    // Step 1: Read current portfolio data to find AURA
    const portfolioResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Portfolio Overview!A:J',
    });

    const rows = portfolioResponse.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'No data found in Portfolio Overview sheet'
      }, { status: 404 });
    }

    // Find AURA row (assuming Symbol is in column B)
    const auraRowIndex = rows.findIndex((row, idx) => 
      idx > 0 && row[1]?.toString().toUpperCase() === 'AURA'
    );

    if (auraRowIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'AURA asset not found in sheet'
      }, { status: 404 });
    }

    // Step 2: Fetch AURA price from CoinGecko
    const coinGeckoResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=aura-network&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!coinGeckoResponse.ok) {
      throw new Error(`CoinGecko API error: ${coinGeckoResponse.status}`);
    }

    const priceData = await coinGeckoResponse.json();
    const newPrice = priceData['aura-network']?.usd;

    if (newPrice === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Could not fetch AURA price from CoinGecko'
      }, { status: 502 });
    }

    // Step 3: Update the price in Google Sheets
    // Current price is column H (index 7), Last Price Update is column J (index 9)
    const currentPriceRange = `Portfolio Overview!H${auraRowIndex + 1}`;
    const lastUpdateRange = `Portfolio Overview!J${auraRowIndex + 1}`;
    const currentTimestamp = new Date().toISOString();

    // Update both cells
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          {
            range: currentPriceRange,
            values: [[newPrice]]
          },
          {
            range: lastUpdateRange,
            values: [[currentTimestamp]]
          }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully updated AURA price',
      asset: 'AURA',
      oldPrice: rows[auraRowIndex][7] || 'Unknown',
      newPrice: newPrice,
      timestamp: currentTimestamp,
      updatedCells: 2
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
    message: 'Single price update endpoint - use POST to update AURA price',
    usage: 'POST to this endpoint to test updating AURA price from CoinGecko'
  });
}
