import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Google Sheets endpoint is configured
    if (!process.env.GOOGLE_SHEETS_ENDPOINT) {
      return NextResponse.json({
        success: false,
        error: 'KPI data service is not yet configured. Please contact the administrator.',
        errorCode: 'SERVICE_NOT_CONFIGURED'
      }, { status: 503 });
    }

    // Fetch KPI data using Google Sheets API
    try {
      const response = await fetch(process.env.GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=getKPIData`,
      });

      if (!response.ok) {
        console.error('Google Sheets API HTTP error:', response.status, response.statusText);
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Google Sheets KPI API response:', data);

      if (data.success && data.kpiData) {
        return NextResponse.json({
          success: true,
          kpiData: data.kpiData
        });
      } else {
        console.error('Google Sheets API returned error:', data);
        throw new Error(data.error || 'Unknown error from Google Sheets API');
      }

    } catch (apiError) {
      console.error('Google Sheets API error:', apiError);
      return NextResponse.json({
        success: false,
        error: 'Unable to connect to KPI database. Please try again later.',
        errorCode: 'EXTERNAL_SERVICE_ERROR'
      }, { status: 502 });
    }

  } catch (error: unknown) {
    console.error('Error fetching KPI data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during KPI data fetch',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
