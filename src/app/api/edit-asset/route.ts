import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      symbol, 
      quantity, 
      riskLevel, 
      location, 
      coinType,
      thesis,
      originalAsset
    } = body;

    console.log(`=== EDITING ASSET: ${symbol} ===`);
    console.log('Edit data:', { symbol, quantity, riskLevel, location, coinType, thesis });
    console.log('Original asset data:', originalAsset);

    // Validate required fields
    if (!symbol) {
      return NextResponse.json({
        success: false,
        error: 'Symbol is required'
      }, { status: 400 });
    }

    if (quantity === undefined || quantity === null) {
      return NextResponse.json({
        success: false,
        error: 'Quantity is required'
      }, { status: 400 });
    }

    // Edit the asset in Google Sheets using original asset data to identify which asset to edit
    const result = await sheetsAdapter.editPortfolioAsset({
      symbol: symbol.toUpperCase(),
      quantity: parseFloat(quantity),
      riskLevel: riskLevel || 'Medium',
      location: location || 'Exchange',
      coinType: coinType || 'Altcoin',
      thesis: thesis || '',
      originalAsset: originalAsset
    });

    if (result.success) {
      console.log(`Asset ${symbol} edited successfully`);
      return NextResponse.json({
        success: true,
        message: `Asset ${symbol} updated successfully`,
        data: result.data
      });
    } else {
      console.error(`Failed to edit asset ${symbol}:`, result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to edit asset'
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error in edit-asset endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
