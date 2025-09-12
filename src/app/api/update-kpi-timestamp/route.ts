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
    
    // Use explicit formatting to ensure correct year
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
    
    console.log('Generated timestamp:', timestamp, 'Current year:', year);

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
