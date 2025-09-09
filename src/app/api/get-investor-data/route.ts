import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { investorId } = await request.json();

    if (!investorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Investor ID is required',
        errorCode: 'MISSING_INVESTOR_ID'
      }, { status: 400 });
    }

    // Check if Google Sheets endpoint is configured
    if (!process.env.GOOGLE_SHEETS_ENDPOINT) {
      return NextResponse.json({
        success: false,
        error: 'Investor data service is not yet configured. Please contact the administrator.',
        errorCode: 'SERVICE_NOT_CONFIGURED'
      }, { status: 503 });
    }

    // Fetch investor data using Google Sheets API
    try {
      const response = await fetch(process.env.GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=getInvestorData&investorId=${encodeURIComponent(investorId.toUpperCase())}`,
      });

      if (!response.ok) {
        console.error('Google Sheets API HTTP error:', response.status, response.statusText);
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Google Sheets API response:', data);

      if (data.success && data.investorData) {
        return NextResponse.json({
          success: true,
          investorData: data.investorData
        });
      } else {
        console.error('Google Sheets API returned error:', data);
        throw new Error(data.error || 'Unknown error from Google Sheets API');
      }

    } catch (apiError) {
      console.error('Google Sheets API error:', apiError);
      return NextResponse.json({
        success: false,
        error: 'Unable to connect to investor database. Please try again later.',
        errorCode: 'EXTERNAL_SERVICE_ERROR'
      }, { status: 502 });
    }

  } catch (error: unknown) {
    console.error('Error fetching investor data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during data fetch',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
