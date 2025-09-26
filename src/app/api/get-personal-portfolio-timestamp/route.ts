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

    // Get ONLY cell B9 from the KPIs tab (Last Updated - personal)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'KPIs!B9', // Just cell B9
    });

    const values = response.data.values;
    const timestamp = values && values[0] && values[0][0] ? values[0][0] : null;

    return NextResponse.json({
      success: true,
      timestamp: timestamp,
      timestampType: typeof timestamp,
      rawResponse: response.data
    });

  } catch (error) {
    console.error('Error getting Personal Portfolio timestamp:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// POST endpoint for testing
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Get Personal Portfolio timestamp API endpoint',
    description: 'This endpoint fetches the timestamp from cell B9 of the KPIs tab',
    usage: 'GET this endpoint to retrieve the Personal Portfolio last updated timestamp'
  });
}
