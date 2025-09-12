import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    // Test write access to Google Sheets
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID || '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

    if (!serviceAccountEmail || !privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Google Sheets API credentials'
      }, { status: 503 });
    }

    // Create authentication with write permissions
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Test write to a safe cell (W1 - within the 23 column limit)
    const testTimestamp = new Date().toISOString();
    const testRange = 'Portfolio Overview!W1';

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: testRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[`Test Write: ${testTimestamp}`]]
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully wrote to Google Sheets',
      testRange: testRange,
      testValue: `Test Write: ${testTimestamp}`,
      updatedCells: response.data.updatedCells,
      timestamp: testTimestamp
    });

  } catch (error) {
    console.error('Google Sheets write test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test write endpoint - use POST to test writing to Google Sheets',
    usage: 'POST to this endpoint to test write access'
  });
}
