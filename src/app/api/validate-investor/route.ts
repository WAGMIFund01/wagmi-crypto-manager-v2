import { NextResponse } from 'next/server';
// import { sheetsAdapter } from '@/lib/sheetsAdapter'; // TODO: Use when Google Sheets API is ready

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

    // TODO: Replace with real Google Sheets API when endpoint is ready
    // For now, return a proper error indicating the service is not configured
    return NextResponse.json({
      valid: false,
      error: 'Investor validation service is not yet configured. Please contact the administrator.',
      errorCode: 'SERVICE_NOT_CONFIGURED'
    }, { status: 503 });

    // Mock data removed - this was masking real issues
    // const mockInvestors = { ... };

  } catch (error: unknown) {
    console.error('Error validating investor ID:', error);
    return NextResponse.json({
      valid: false,
      error: 'Internal server error during investor validation',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
