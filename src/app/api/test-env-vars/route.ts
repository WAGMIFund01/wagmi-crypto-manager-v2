import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    return NextResponse.json({
      success: true,
      environment: {
        hasServiceAccountEmail: !!serviceAccountEmail,
        hasPrivateKey: !!privateKey,
        hasSheetId: !!sheetId,
        serviceAccountEmail: serviceAccountEmail ? serviceAccountEmail.substring(0, 20) + '...' : 'NOT_SET',
        privateKeyLength: privateKey ? privateKey.length : 0,
        privateKeyStart: privateKey ? privateKey.substring(0, 50) + '...' : 'NOT_SET',
        sheetId: sheetId || 'NOT_SET'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
