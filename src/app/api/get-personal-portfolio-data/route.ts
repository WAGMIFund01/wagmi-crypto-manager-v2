import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    logger.info('Fetching personal portfolio data', { requestId });
    
    // Initialize Google Sheets connection
    await sheetsAdapter.initializeServiceAccount();
    
    if (!sheetsAdapter.sheets) {
      throw new Error('Sheets API not initialized');
    }

    // Get data from Personal portfolio sheet
    const response = await sheetsAdapter.sheets.spreadsheets.values.get({
      spreadsheetId: sheetsAdapter.sheetId,
      range: 'Personal portfolio!A:M',
    });

    const rows = response.data.values || [];
    
    if (rows.length <= 1) {
      logger.info('Personal portfolio data fetched successfully', { 
        requestId, 
        assetCount: 0 
      });
      return NextResponse.json({
        success: true,
        assets: []
      });
    }

    // Process the data (skip header row)
    const assets = rows.slice(1).map((row: any[], index: number) => {
      try {
        return {
          assetName: row[0] || '',
          symbol: row[1] || '',
          chain: row[2] || '',
          riskLevel: row[3] || '',
          location: row[4] || '',
          coinType: row[5] || '',
          quantity: parseFloat(row[6]) || 0,
          currentPrice: parseFloat(row[7]) || 0,
          totalValue: parseFloat(row[8]) || 0,
          lastPriceUpdate: row[9] || '',
          coinGeckoId: row[10] || '',
          priceChange24h: parseFloat(row[11]) || 0,
          thesis: row[12] || ''
        };
      } catch (error) {
        logger.error('Error processing personal portfolio asset row', { 
          requestId, 
          rowIndex: index + 1, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        return null;
      }
    }).filter(asset => asset !== null);

    logger.info('Personal portfolio data fetched successfully', { 
      requestId, 
      assetCount: assets.length 
    });

    return NextResponse.json({
      success: true,
      assets
    });

  } catch (error) {
    logger.error('Error fetching personal portfolio data', { 
      requestId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch personal portfolio data'
    }, { status: 500 });
  }
}
