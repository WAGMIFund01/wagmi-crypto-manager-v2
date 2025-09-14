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

    // Use the unified SheetsAdapter to validate investor
    const result = await sheetsAdapter.validateInvestor(investorId);

    if (result.valid && result.investor) {
      return NextResponse.json({
        valid: true,
        investorId: investorId.toUpperCase(),
        investor: result.investor,
        message: 'Investor ID validated successfully'
      });
    } else {
      return NextResponse.json({
        valid: false,
        error: 'Invalid Investor ID. Please check your ID and try again.',
        errorCode: 'INVALID_INVESTOR_ID'
      }, { status: 401 });
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
