import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log('Received edit personal asset request body:', body);
    
    const { symbol, quantity, riskLevel, location, coinType, thesis, originalAsset } = body;

    // Validate required fields
    if (!symbol || quantity === undefined || !riskLevel || !location || !coinType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: symbol, quantity, riskLevel, location, and coinType are required',
        errorCode: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Validate quantity
    if (quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Quantity must be greater than 0',
        errorCode: 'INVALID_QUANTITY'
      }, { status: 400 });
    }

    // Prepare edit data
    const editData = {
      symbol: symbol.trim().toUpperCase(),
      quantity: parseFloat(quantity),
      riskLevel: riskLevel.trim(),
      location: location.trim(),
      coinType: coinType.trim(),
      thesis: thesis || '',
      originalAsset: originalAsset
    };

    console.log('Calling sheetsAdapter.editPersonalPortfolioAsset with:', editData);

    // Edit asset in personal portfolio
    const result = await sheetsAdapter.editPersonalPortfolioAsset(editData);
    console.log('Edit result:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Asset updated successfully in personal portfolio',
        data: result.data
      });
    } else {
      console.log('Asset edit failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to update asset in personal portfolio',
        errorCode: 'ASSET_EDIT_FAILED'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in edit-personal-asset endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
