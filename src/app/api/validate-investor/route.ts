import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function POST(request: Request) {
  try {
    const { investorId } = await request.json();

    if (!investorId) {
      return NextResponse.json({ valid: false, error: 'Investor ID is required' }, { status: 400 });
    }

    // Validate investor ID against Google Sheets
    const result = await sheetsAdapter.validateInvestor(investorId.toUpperCase());
    
    if (result.valid && result.investor) {
      return NextResponse.json({ 
        valid: true, 
        investorId: result.investor.investor_id,
        investor: {
          name: result.investor.name,
          email: result.investor.email,
          investmentValue: result.investor.investment_value,
          currentValue: result.investor.current_value,
          returnPercentage: result.investor.return_percentage
        },
        message: 'Investor ID validated successfully'
      });
    } else {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid Investor ID. Please check your ID and try again.' 
      }, { status: 401 });
    }

  } catch (error: unknown) {
    console.error('Error validating investor ID:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Unable to verify Investor ID. Please try again.' 
    }, { status: 500 });
  }
}
