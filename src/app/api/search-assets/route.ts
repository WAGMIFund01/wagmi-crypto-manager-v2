import { NextResponse } from 'next/server';
import { assetSearchService } from '@/features/transactions/services/AssetSearchService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter is required and must be at least 2 characters',
        errorCode: 'INVALID_QUERY'
      }, { status: 400 });
    }

    const searchLimit = limit ? parseInt(limit) : 20;
    
    if (isNaN(searchLimit) || searchLimit < 1 || searchLimit > 50) {
      return NextResponse.json({
        success: false,
        error: 'Limit must be a number between 1 and 50',
        errorCode: 'INVALID_LIMIT'
      }, { status: 400 });
    }

    // Search for assets
    const results = await assetSearchService.searchAssets({
      query: query.trim(),
      limit: searchLimit
    });

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      query: query.trim()
    });

  } catch (error: unknown) {
    console.error('Error in search-assets endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search for assets',
      errorCode: 'SEARCH_FAILED'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coinGeckoId } = body;

    if (!coinGeckoId) {
      return NextResponse.json({
        success: false,
        error: 'coinGeckoId is required',
        errorCode: 'MISSING_COINGECKO_ID'
      }, { status: 400 });
    }

    // Get detailed asset information
    const assetDetails = await assetSearchService.getAssetDetails(coinGeckoId);

    if (!assetDetails) {
      return NextResponse.json({
        success: false,
        error: 'Asset not found',
        errorCode: 'ASSET_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      asset: assetDetails
    });

  } catch (error: unknown) {
    console.error('Error in search-assets POST endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get asset details',
      errorCode: 'ASSET_DETAILS_FAILED'
    }, { status: 500 });
  }
}
