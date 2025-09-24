import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import errorMonitor from '@/lib/errorMonitor';
import { withApiMiddleware } from '@/lib/apiMiddleware';

export interface PerformanceData {
  month: string;
  endingAUM: number;
  wagmiMoM: number;
  totalMoM: number;
  total3MoM: number;
  wagmiCumulative: number;
  totalCumulative: number;
  total3Cumulative: number;
}

async function getPerformanceDataHandler(req: NextRequest) {
  try {
    logger.info('Fetching performance data from MoM performance sheet');
    
    // Google Sheet ID for WAGMI Investment Manager Database
    const SHEET_ID = '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';
    
    // Fetch from the "MoM performance" sheet
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=MoM%20performance&tqx=out:json`;
    
    console.log('🔍 Fetching performance data from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Google Sheets API HTTP error:', response.status, response.statusText);
      throw new Error(`Failed to fetch performance data: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    
    // Remove the prefix that Google Sheets adds
    const jsonText = text.replace(/^.*?\(/, '').replace(/\);?$/, '');
    
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Google Sheets response:', parseError);
      throw new Error('Failed to parse performance data from Google Sheets');
    }

    if (!data.table || !data.table.rows) {
      console.error('Invalid data structure from Google Sheets:', data);
      throw new Error('Invalid performance data structure from Google Sheets');
    }

    const rows = data.table.rows;
    const performanceData: PerformanceData[] = [];

    // Skip header rows and process data rows
    // Based on your spreadsheet, data starts from row 4 (index 3) and goes to row 14 (index 13)
    for (let i = 3; i < rows.length && i < 14; i++) {
      const row = rows[i];
      if (!row.c || row.c.length < 18) continue; // Ensure we have enough columns

      // Extract data from specific columns
      const month = row.c[1]?.v; // Column B - Date
      const endingAUM = row.c[6]?.v; // Column G - Ending AUM
      const wagmiMoM = row.c[7]?.v; // Column H - MoM Return
      const wagmiCumulative = row.c[8]?.v; // Column I - Cumulative Return
      const totalMoM = row.c[11]?.v; // Column L - MoM return (Total)
      const totalCumulative = row.c[12]?.v; // Column M - Cumulative Return (Total)
      const total3MoM = row.c[15]?.v; // Column P - MoM return (Total 3)
      const total3Cumulative = row.c[16]?.v; // Column Q - Cumulative Return (Total 3)

      // Skip rows with no month data (future months)
      if (!month) continue;

      // Convert month to proper format (e.g., "Oct-2024")
      let formattedMonth = month;
      if (typeof month === 'string' && month.includes('/')) {
        const [monthPart, yearPart] = month.split('/');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(monthPart) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          formattedMonth = `${monthNames[monthIndex]}-${yearPart}`;
        }
      }

      performanceData.push({
        month: formattedMonth,
        endingAUM: parseFloat(endingAUM) || 0,
        wagmiMoM: parseFloat(wagmiMoM) || 0,
        totalMoM: parseFloat(totalMoM) || 0,
        total3MoM: parseFloat(total3MoM) || 0,
        wagmiCumulative: parseFloat(wagmiCumulative) || 0,
        totalCumulative: parseFloat(totalCumulative) || 0,
        total3Cumulative: parseFloat(total3Cumulative) || 0,
      });
    }

    logger.info('Performance data fetched successfully', {
      recordCount: performanceData.length,
      months: performanceData.map(d => d.month)
    });

    return NextResponse.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Error fetching performance data:', errorObj);
    errorMonitor.recordError(errorObj);
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

// Wrap with API middleware for logging and monitoring
export const GET = withApiMiddleware(getPerformanceDataHandler);