import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

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

    // Use new SheetsAdapter method
    const transactions = await sheetsAdapter.getTransactions(investorId.toUpperCase());

    return NextResponse.json({
      success: true,
      transactions: transactions,
      source: 'SheetsAdapter.getTransactions()'
    });

  } catch (error: unknown) {
    console.error('Error fetching transaction data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during data fetch',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
