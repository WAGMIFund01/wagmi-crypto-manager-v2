import { NextResponse } from 'next/server';
import { assetManagementService } from '@/features/transactions/services/AssetManagementService';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    console.log('Remove asset request for symbol:', symbol);

    if (!symbol || symbol.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Symbol parameter is required',
        errorCode: 'MISSING_SYMBOL'
      }, { status: 400 });
    }

    // Remove the asset
    console.log('Calling assetManagementService.removeAsset with:', symbol.trim());
    const result = await assetManagementService.removeAsset(symbol.trim());
    console.log('AssetManagementService result:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        symbol: symbol.trim().toUpperCase()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || result.message,
        errorCode: 'ASSET_REMOVAL_FAILED'
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error in remove-asset endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
