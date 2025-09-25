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
      chain: chain?.trim() || 'Unknown',
      riskLevel: riskLevel || 'Medium',
      location: location?.trim() || 'Unknown',
      coinType: coinType || 'Altcoin',
      thesis: thesis?.trim() || ''
    };

    console.log('Adding personal asset with data:', assetData);

    // Use the asset management service to add the asset to personal portfolio
    const result = await assetManagementService.addPersonalAsset(assetData);

    if (result.success) {
      console.log('Personal asset added successfully:', result);
      return NextResponse.json({
        success: true,
        message: 'Personal asset added successfully',
        asset: result.asset
      });
    } else {
      console.error('Failed to add personal asset:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to add personal asset',
        errorCode: 'ADD_ASSET_FAILED'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in add personal asset API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error while adding personal asset',
      details: errorMessage,
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
