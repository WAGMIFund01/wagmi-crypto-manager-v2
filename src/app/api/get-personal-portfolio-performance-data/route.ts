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

    // Process data rows - use same logic as WAGMI performance data
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.c || row.c.length < 17) continue; // Ensure we have enough columns

      // Extract data from specific columns (same structure as WAGMI)
      const monthCell = row.c[1]; // Column B - Date
      const endingAUM = row.c[6]?.v; // Column G - Ending AUM
      const personalMoM = row.c[7]?.v; // Column H - Personal MoM Return
      const personalCumulative = row.c[8]?.v; // Column I - Personal Cumulative Return
      const totalMoM = row.c[11]?.v; // Column L - MoM return (Total)
      const totalCumulative = row.c[12]?.v; // Column M - Cumulative Return (Total)
      const total3MoM = row.c[15]?.v; // Column P - MoM return (Total 3)
      const total3Cumulative = row.c[16]?.v; // Column Q - Cumulative Return (Total 3)

      // Skip rows with no month data (future months or empty rows)
      if (!monthCell?.f) continue;

      // Use the formatted value from Google Sheets (e.g., " Oct-2024")
      const formattedMonth = monthCell.f.trim();
      
      // Skip future months - only process current and historical data
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      // Parse the month from the formatted string (e.g., "Oct-2024")
      const monthMatch = formattedMonth.match(/(\w{3})-(\d{4})/);
      if (!monthMatch) continue;
      
      const monthName = monthMatch[1];
      const year = parseInt(monthMatch[2]);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthNames.indexOf(monthName);
      
      // Skip future months
      if (year > currentYear || (year === currentYear && monthIndex > currentMonth)) {
        continue;
      }

      performanceData.push({
        month: formattedMonth,
        endingAUM: parseFloat(endingAUM) || 0,
        // Convert decimal percentages to percentage values (0.285 -> 28.5)
        personalMoM: (parseFloat(personalMoM) || 0) * 100,
        totalMoM: (parseFloat(totalMoM) || 0) * 100,
        total3MoM: (parseFloat(total3MoM) || 0) * 100,
        personalCumulative: (parseFloat(personalCumulative) || 0) * 100,
        totalCumulative: (parseFloat(totalCumulative) || 0) * 100,
        total3Cumulative: (parseFloat(total3Cumulative) || 0) * 100,
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

