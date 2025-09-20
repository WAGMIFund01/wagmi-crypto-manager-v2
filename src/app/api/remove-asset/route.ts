import { NextResponse } from 'next/server';
import { assetManagementService } from '@/features/transactions/services/AssetManagementService';

export async function DELETE(request: Request) {
  try {
    console.log('=== REMOVE ASSET API CALLED ===');
    
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    console.log('Remove asset request for symbol:', symbol);

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
          errorCode: 'DATABASE_CONNECTION_FAILED'
        }, { status: 500 });
      }
    } catch (connectionError) {
      console.error('ERROR: SheetsAdapter initialization failed:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Database initialization failed',
        errorCode: 'DATABASE_INITIALIZATION_FAILED'
      }, { status: 500 });
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
