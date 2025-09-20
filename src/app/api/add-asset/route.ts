import { NextResponse } from 'next/server';
import { assetManagementService } from '@/features/transactions/services/AssetManagementService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
      chain: chain?.trim() || '',
      riskLevel: riskLevel?.trim() || 'Medium',
      location: location?.trim() || '',
      coinType: coinType?.trim() || 'Altcoin',
      thesis: thesis?.trim() || ''
    };

    // Validate asset data
    const validation = assetManagementService.validateAssetData(assetData);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.errors.join(', '),
        errorCode: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    // Add the asset
    const result = await assetManagementService.addAsset(assetData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        assetData: {
          symbol: assetData.symbol,
          name: assetData.name,
          quantity: assetData.quantity,
          currentPrice: assetData.currentPrice,
          totalValue: assetData.quantity * assetData.currentPrice
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || result.message,
        errorCode: 'ASSET_ADDITION_FAILED'
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error in add-asset endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
