import { NextResponse } from 'next/server';
import { assetManagementService } from '@/features/transactions/services/AssetManagementService';

export async function DELETE(request: Request) {
  try {
    console.log('=== REMOVE PERSONAL ASSET API CALLED ===');
    
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    console.log('Remove personal asset request for symbol:', symbol);

    if (!symbol || symbol.trim().length === 0) {
      console.log('ERROR: Symbol parameter missing');
      return NextResponse.json({
        success: false,
        error: 'Symbol parameter is required',
        errorCode: 'MISSING_SYMBOL'
      }, { status: 400 });
    }

    // Test SheetsAdapter initialization first
    console.log('Testing SheetsAdapter initialization...');
    try {
      const { sheetsAdapter } = await import('@/lib/sheetsAdapter');
      console.log('SheetsAdapter imported successfully');
      
      // Test connection
      const connectionTest = await sheetsAdapter.testConnection();
      console.log('Connection test result:', connectionTest);
      
      if (!connectionTest) {
        console.log('ERROR: SheetsAdapter connection failed');
        return NextResponse.json({
          success: false,
          error: 'Database connection failed',
          errorCode: 'CONNECTION_FAILED'
        }, { status: 500 });
      }
    } catch (importError) {
      console.error('Failed to import SheetsAdapter:', importError);
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize database connection',
        details: importError instanceof Error ? importError.message : 'Unknown import error',
        errorCode: 'INITIALIZATION_FAILED'
      }, { status: 500 });
    }

    // Use the asset management service to remove the personal asset
    const result = await assetManagementService.removePersonalAsset(symbol.trim().toUpperCase());

    if (result.success) {
      console.log('Personal asset removed successfully:', result);
      return NextResponse.json({
        success: true,
        message: `Personal asset ${symbol} removed successfully`,
        removedAsset: result.removedAsset
      });
    } else {
      console.error('Failed to remove personal asset:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to remove personal asset',
        errorCode: 'REMOVE_ASSET_FAILED'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in remove personal asset API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error while removing personal asset',
      details: errorMessage,
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
