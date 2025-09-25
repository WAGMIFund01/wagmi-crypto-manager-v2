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

    console.log(`=== EDITING PERSONAL ASSET: ${symbol} ===`);
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

    if (quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Quantity must be greater than 0'
      }, { status: 400 });
    }

    // Prepare the updated asset data
    const updatedAssetData = {
      symbol: symbol.trim().toUpperCase(),
      quantity: parseFloat(quantity),
      riskLevel: riskLevel || originalAsset?.riskLevel || 'Medium',
      location: location?.trim() || originalAsset?.location || 'Unknown',
      coinType: coinType || originalAsset?.coinType || 'Altcoin',
      thesis: thesis?.trim() || originalAsset?.thesis || ''
    };

    console.log('Updated personal asset data:', updatedAssetData);

    // Use the sheets adapter to edit the personal asset
    const result = await sheetsAdapter.editPersonalAsset(updatedAssetData);

    if (result.success) {
      console.log('Personal asset edited successfully:', result);
      return NextResponse.json({
        success: true,
        message: 'Personal asset updated successfully',
        asset: result.asset
      });
    } else {
      console.error('Failed to edit personal asset:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to update personal asset'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in edit personal asset API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error while updating personal asset',
      details: errorMessage
    }, { status: 500 });
  }
}
