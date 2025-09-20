import { NextResponse } from 'next/server';
import { assetSearchService } from '@/features/transactions/services/AssetSearchService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Asset ID is required',
        errorCode: 'MISSING_ASSET_ID'
      }, { status: 400 });
    }

    console.log('Fetching asset details for ID:', id);

    // Get detailed asset information including current price
    const assetDetails = await assetSearchService.getAssetDetails(id);

    if (!assetDetails) {
      return NextResponse.json({
        success: false,
        error: 'Asset not found',
        errorCode: 'ASSET_NOT_FOUND'
      }, { status: 404 });
    }

    console.log('Asset details fetched:', assetDetails);

    return NextResponse.json({
      success: true,
      asset: assetDetails
    });

  } catch (error: unknown) {
    console.error('Error in get-asset-details endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
