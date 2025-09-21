import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
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

    // Read current portfolio data
    const portfolioResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Portfolio Overview!A:L',
    });

    const rows = portfolioResponse.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'No data found in Portfolio Overview sheet'
      }, { status: 404 });
    }

    // Analyze the data structure
    const headerRow = rows[0];
    const dataRows = rows.slice(1);

    const analysis = {
      totalRows: rows.length,
      dataRows: dataRows.length,
      headers: headerRow,
      sampleAssets: dataRows.slice(0, 5).map((row, index) => ({
        rowIndex: index + 2, // Google Sheets row number
        assetName: row[0] || '',
        symbol: row[1] || '',
        chain: row[2] || '',
        riskLevel: row[3] || '',
        location: row[4] || '',
        coinType: row[5] || '',
        quantity: row[6] || '',
        currentPrice: row[7] || '',
        totalValue: row[8] || '',
        lastPriceUpdate: row[9] || '',
        coinGeckoId: row[10] || '',
        priceChange24h: row[11] || '',
        thesis: row[12] || ''
      }))
    };

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug price update error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
