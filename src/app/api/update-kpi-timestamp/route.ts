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

    // Generate current timestamp in a simple format
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Update the KPI tab timestamp (cell B7)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'KPIs!B7',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[timestamp]]
      }
    });

    return NextResponse.json({
      success: true,
      message: 'KPI timestamp updated successfully',
      timestamp: timestamp
    });

  } catch (error) {
    console.error('Error updating KPI timestamp:', error);
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
    message: 'KPI timestamp update API endpoint',
    description: 'This endpoint updates the timestamp in the KPI tab (cell B7)',
    usage: 'POST to this endpoint to trigger timestamp update'
  });
}
