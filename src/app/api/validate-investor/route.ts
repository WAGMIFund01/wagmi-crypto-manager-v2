import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function POST(request: Request) {
  try {
    const { investorId } = await request.json();

    if (!investorId) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Investor ID is required',
        errorCode: 'MISSING_INVESTOR_ID'
      }, { status: 400 });
    }

    // Check if Google Sheets endpoint is configured
    if (!process.env.GOOGLE_SHEETS_ENDPOINT) {
      return NextResponse.json({
        valid: false,
        error: 'Investor validation service is not yet configured. Please contact the administrator.',
        errorCode: 'SERVICE_NOT_CONFIGURED'
      }, { status: 503 });
    }

    // Validate investor using Google Sheets API (server-side call to avoid CORS)
    try {
      const response = await fetch(process.env.GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validateInvestor',
          investorId: investorId.toUpperCase()
        }),
      });

      if (!response.ok) {
        console.error('Google Sheets API HTTP error:', response.status, response.statusText);
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Google Sheets API response:', data);

      if (data.success && data.valid) {
        return NextResponse.json({
          valid: true,
          investorId: investorId.toUpperCase(),
          investor: data.investor,
          message: 'Investor ID validated successfully'
        });
      } else if (data.success && !data.valid) {
        return NextResponse.json({
          valid: false,
          error: 'Invalid Investor ID. Please check your ID and try again.',
          errorCode: 'INVALID_INVESTOR_ID'
        }, { status: 401 });
      } else {
        console.error('Google Sheets API returned error:', data);
        throw new Error(data.error || 'Unknown error from Google Sheets API');
      }

    } catch (apiError) {
      console.error('Google Sheets API error:', apiError);
      return NextResponse.json({
        valid: false,
        error: 'Unable to connect to investor database. Please try again later.',
        errorCode: 'EXTERNAL_SERVICE_ERROR'
      }, { status: 502 });
    }

  } catch (error: unknown) {
    console.error('Error validating investor ID:', error);
    return NextResponse.json({
      valid: false,
      error: 'Internal server error during investor validation',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
