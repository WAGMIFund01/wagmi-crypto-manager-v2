import { NextResponse } from 'next/server';
// import { config } from '@/lib/config'; // TODO: Use when Google Sheets integration is ready

export async function POST(request: Request) {
  try {
    const { investorId } = await request.json();

    if (!investorId) {
      return NextResponse.json({ valid: false, error: 'Investor ID is required' }, { status: 400 });
    }

    // For now, we'll use a simple validation
    // TODO: Replace with actual Google Sheets API call when ready
    const validInvestorIds = ['INV001', 'INV002', 'INV003', 'INV004', 'INV005', 'INV006'];
    
    if (validInvestorIds.includes(investorId.toUpperCase())) {
      return NextResponse.json({ 
        valid: true, 
        investorId: investorId.toUpperCase(),
        message: 'Investor ID validated successfully'
      });
    } else {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid Investor ID. Please check your ID and try again.' 
      }, { status: 401 });
    }

    // Future Google Sheets integration:
    // const googleSheetsUrl = `${config.googleSheetsEndpoint}?action=validateInvestor&investorId=${investorId}`;
    // const response = await fetch(googleSheetsUrl);
    // const data = await response.json();
    // return NextResponse.json({ valid: data.success && data.data.length > 0 });

  } catch (error: unknown) {
    console.error('Error validating investor ID:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Unable to verify Investor ID. Please try again.' 
    }, { status: 500 });
  }
}
