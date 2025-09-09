import { NextResponse } from 'next/server';
// import { sheetsAdapter } from '@/lib/sheetsAdapter'; // TODO: Use when Google Sheets API is ready

export async function POST(request: Request) {
  try {
    const { investorId } = await request.json();

    if (!investorId) {
      return NextResponse.json({ valid: false, error: 'Investor ID is required' }, { status: 400 });
    }

    // For now, use mock data based on your Google Sheet structure
    // TODO: Replace with real Google Sheets API when endpoint is ready
    const mockInvestors = {
      'LK1': { name: 'Leke Karunwi', email: 'leke@example.com', investmentValue: 2000, currentValue: 3199.60, returnPercentage: 60 },
      'MO2': { name: 'Mariam Oyawoye', email: 'mummy@example.com', investmentValue: 1050.06, currentValue: 1676.71, returnPercentage: 60 },
      'FO3': { name: 'Fifehanmi Oyawoye', email: 'fifehanmi@example.com', investmentValue: 1823.91, currentValue: 2456.83, returnPercentage: 35 },
      'RA4': { name: 'Rinsola Aminu', email: 'rinsola@example.com', investmentValue: 828.30, currentValue: 1298.74, returnPercentage: 57 },
      'OK5': { name: 'Oyinkan Karunwi', email: 'oyinkan@example.com', investmentValue: 991.57, currentValue: 1092.17, returnPercentage: 10 },
      'OA6': { name: 'Omair Ansari', email: 'omair@example.com', investmentValue: 11212.46, currentValue: 12253.40, returnPercentage: 9 }
    };

    const investor = mockInvestors[investorId.toUpperCase() as keyof typeof mockInvestors];
    
    if (investor) {
      return NextResponse.json({ 
        valid: true, 
        investorId: investorId.toUpperCase(),
        investor: {
          name: investor.name,
          email: investor.email,
          investmentValue: investor.investmentValue,
          currentValue: investor.currentValue,
          returnPercentage: investor.returnPercentage
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
