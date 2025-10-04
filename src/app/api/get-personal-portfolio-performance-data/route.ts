import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import errorMonitor from '@/lib/errorMonitor';
import { withApiMiddleware } from '@/lib/apiMiddleware';

export interface PersonalPortfolioPerformanceData {
  month: string;
  endingAUM: number;
  personalMoM: number;
  totalMoM: number;
  total3MoM: number;
  personalCumulative: number;
  totalCumulative: number;
  total3Cumulative: number;
}

async function getPersonalPortfolioPerformanceDataHandler(req: NextRequest) {
  try {
    logger.info('Fetching personal portfolio performance data from Personal portfolio historical sheet');
    
    // Google Sheet ID for WAGMI Investment Manager Database
    const SHEET_ID = '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';
    
    // Fetch from the "Personal portfolio historical" sheet
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Personal%20portfolio%20historical&tqx=out:json`;
    
    console.log('🔍 Fetching personal portfolio performance data from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Google Sheets API HTTP error:', response.status, response.statusText);
      throw new Error(`Failed to fetch personal portfolio performance data: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    
    // Parse the Google Sheets response - it's wrapped in a function call
    const match = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/);
    if (!match) {
      throw new Error('Could not parse Google Sheets response format');
    }
    
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch (parseError) {
      console.error('Failed to parse Google Sheets JSON:', parseError);
      throw new Error('Failed to parse personal portfolio performance data from Google Sheets');
    }

    if (!data.table || !data.table.rows) {
      console.error('Invalid data structure from Google Sheets:', data);
      throw new Error('Invalid personal portfolio performance data structure from Google Sheets');
    }

    const rows = data.table.rows;
    const performanceData: PersonalPortfolioPerformanceData[] = [];

    // Process data rows - data starts from row 0 (Oct-2024)
    // Based on the image description, the structure is:
    // Column B: Date (month)
    // Column G: Ending AUM (WAGMI section)
    // Column H: MoM Return (WAGMI section)
    // Column I: Cumulative Return (WAGMI section) - but has #DIV/0! errors
    // Column K: MoM return (Total section)
    // Column L: Cumulative Return (Total section)
    // Column N: MoM return (Total 3 section)
    // Column O: Cumulative Return (Total 3 section)

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.c || row.c.length === 0) continue;

      const month = row.c[1]?.v; // Column B (Date)
      const endingAUM = row.c[6]?.v; // Column G (Ending AUM)
      const personalMoM = row.c[7]?.v; // Column H (Personal MoM)
      const totalMoM = row.c[10]?.v; // Column K (Total MoM)
      const total3MoM = row.c[13]?.v; // Column N (Total 3 MoM)
      const personalCumulative = row.c[8]?.v; // Column I (Personal Cumulative)
      const totalCumulative = row.c[11]?.v; // Column L (Total Cumulative)
      const total3Cumulative = row.c[14]?.v; // Column O (Total 3 Cumulative)

      // Skip rows with missing essential data
      if (!month || endingAUM === undefined || personalMoM === undefined) {
        continue;
      }

      // Handle #DIV/0! errors by setting to 0 or null
      const safePersonalCumulative = (personalCumulative === '#DIV/0!' || personalCumulative === null) ? 0 : personalCumulative;
      const safeTotalCumulative = (totalCumulative === '#DIV/0!' || totalCumulative === null) ? 0 : totalCumulative;
      const safeTotal3Cumulative = (total3Cumulative === '#DIV/0!' || total3Cumulative === null) ? 0 : total3Cumulative;

      performanceData.push({
        month: month.toString(),
        endingAUM: parseFloat(endingAUM) || 0,
        personalMoM: parseFloat(personalMoM) || 0,
        totalMoM: parseFloat(totalMoM) || 0,
        total3MoM: parseFloat(total3MoM) || 0,
        personalCumulative: parseFloat(safePersonalCumulative) || 0,
        totalCumulative: parseFloat(safeTotalCumulative) || 0,
        total3Cumulative: parseFloat(safeTotal3Cumulative) || 0,
      });
    }

    logger.info('Personal portfolio performance data fetched successfully', {
      dataCount: performanceData.length
    });

    return NextResponse.json({
      success: true,
      data: performanceData
    });

  } catch (error: unknown) {
    const errorMessage = 'Internal server error during personal portfolio performance data fetch';
    
    logger.error(errorMessage, error as Error, {
      endpoint: '/api/get-personal-portfolio-performance-data',
      errorType: 'personal_portfolio_performance_data_fetch_error',
    });

    // Record error in monitoring system
    errorMonitor.recordError(error as Error, {
      endpoint: '/api/get-personal-portfolio-performance-data',
      additionalContext: {
        operation: 'get_personal_portfolio_performance_data',
        errorType: 'google_sheets_api_error',
      },
    });

    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

// Wrap with API middleware for logging and monitoring
export const GET = withApiMiddleware(getPersonalPortfolioPerformanceDataHandler);

