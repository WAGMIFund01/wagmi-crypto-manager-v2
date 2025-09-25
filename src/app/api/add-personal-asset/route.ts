import { NextResponse } from 'next/server';
import { assetManagementService } from '@/features/transactions/services/AssetManagementService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received personal asset request body:', body);
    const { coinGeckoId, symbol, name, quantity, currentPrice, chain, riskLevel, location, coinType, thesis } = body;

    // Validate required fields
    if (!coinGeckoId || !symbol || !name || !quantity || !currentPrice) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: coinGeckoId, symbol, name, quantity, and currentPrice are required',
        errorCode: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Validate quantity and price
    if (quantity <= 0 || currentPrice <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Quantity and currentPrice must be greater than 0',
        errorCode: 'INVALID_VALUES'
      }, { status: 400 });
    }

    // Prepare asset data
    const assetData = {
      coinGeckoId: coinGeckoId.trim(),
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      quantity: parseFloat(quantity),
      currentPrice: parseFloat(currentPrice),
      chain: chain || 'Unknown',
      riskLevel: riskLevel || 'Medium',
      location: location || 'Unknown',
      coinType: coinType || 'Altcoin',
      thesis: thesis || ''
    };

    console.log('Calling assetManagementService.addPersonalAsset with:', assetData);

    // Add asset to personal portfolio
    const result = await assetManagementService.addPersonalAsset(assetData);
    console.log('AssetManagementService result:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      console.log('Asset addition failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to add asset to personal portfolio',
        errorCode: 'ASSET_ADDITION_FAILED'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in add-personal-asset endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
