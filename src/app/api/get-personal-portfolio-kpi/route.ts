import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    logger.info('Fetching personal portfolio KPI data', { requestId });
    
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
      logger.info('Personal portfolio KPI data fetched successfully', { 
        requestId, 
        totalAUM: 0 
      });
      return NextResponse.json({
        success: true,
        data: {
          totalAUM: 0,
          lastUpdated: new Date().toISOString()
        }
      });
    }

    // Calculate total AUM from the Total Value column (column I, index 8)
    let totalAUM = 0;
    let lastUpdated = new Date().toISOString();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length > 8) {
        const totalValue = parseFloat(row[8]) || 0;
        totalAUM += totalValue;
        
        // Get the most recent price update timestamp
        if (row[9] && row[9].trim()) {
          const rowTimestamp = new Date(row[9]);
          if (!isNaN(rowTimestamp.getTime()) && rowTimestamp > new Date(lastUpdated)) {
            lastUpdated = row[9];
          }
        }
      }
    }

    logger.info('Personal portfolio KPI data fetched successfully', { 
      requestId, 
      totalAUM 
    });

    return NextResponse.json({
      success: true,
      data: {
        totalAUM,
        lastUpdated
      }
    });

  } catch (error) {
    logger.error('Error fetching personal portfolio KPI data', { 
      requestId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch personal portfolio KPI data'
    }, { status: 500 });
  }
}
