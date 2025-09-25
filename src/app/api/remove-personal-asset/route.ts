import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({
        success: false,
        error: 'Symbol parameter is required',
        errorCode: 'MISSING_SYMBOL'
      }, { status: 400 });
    }

    console.log('Removing personal asset with symbol:', symbol);

    try {
      // Remove asset from personal portfolio
      await sheetsAdapter.removePersonalPortfolioAsset(symbol);
      
      console.log('Asset removed successfully from personal portfolio');
      
      return NextResponse.json({
        success: true,
        message: `Asset ${symbol} removed successfully from personal portfolio`
      });

    } catch (error) {
      console.error('Error removing asset from personal portfolio:', error);
      
      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({
          success: false,
          error: `Asset ${symbol} not found in personal portfolio`,
          errorCode: 'ASSET_NOT_FOUND'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: false,
        error: `Failed to remove asset ${symbol} from personal portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'ASSET_REMOVAL_FAILED'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in remove-personal-asset endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
