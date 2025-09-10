import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Google Sheet ID for WAGMI Investment Manager Database
    const SHEET_ID = '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

    // Fetch KPI data directly from Google Sheets using public API
    try {
      // Use the public Google Sheets API to read the KPIs sheet
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=KPIs&tqx=out:json`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Google Sheets API HTTP error:', response.status, response.statusText);
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      const text = await response.text();
      
      // Parse the Google Sheets response (it's wrapped in a callback)
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Google Sheets');
      }
      
      const data = JSON.parse(jsonMatch[1]);
      
      if (!data.table || !data.table.rows) {
        throw new Error('No data found in KPIs sheet');
      }

      // Extract KPI data from the sheet
      const kpiData: {
        totalInvestors?: number;
        totalInvested?: number;
        totalAUM?: number;
        cumulativeReturn?: number;
        monthlyReturn?: number;
      } = {};
      const rows = data.table.rows;
      
      for (const row of rows) {
        if (row.c && row.c.length >= 2) {
          const metricName = row.c[0]?.v; // Column A - Metric Name
          const value = row.c[1]?.v; // Column B - Value
          
          if (metricName && value !== undefined && value !== '') {
            // Map the metric names to our expected format
            switch (metricName.toString().toLowerCase().trim()) {
              case 'total investors':
                kpiData.totalInvestors = parseFloat(value) || 0;
                break;
              case 'total invested':
                kpiData.totalInvested = parseFloat(value) || 0;
                break;
              case 'total aum':
                kpiData.totalAUM = parseFloat(value) || 0;
                break;
              case 'cumulative retur':
              case 'cumulative return':
                kpiData.cumulativeReturn = parseFloat(value) || 0;
                break;
              case 'monthly return':
                kpiData.monthlyReturn = parseFloat(value) || 0;
                break;
            }
          }
        }
      }

      console.log('Google Sheets KPI data extracted:', kpiData);

      return NextResponse.json({
        success: true,
        kpiData: kpiData
      });

    } catch (apiError) {
      console.error('Google Sheets API error:', apiError);
      return NextResponse.json({
        success: false,
        error: 'Unable to connect to Google Sheets. Please check the sheet is public and try again.',
        errorCode: 'EXTERNAL_SERVICE_ERROR'
      }, { status: 502 });
    }

  } catch (error: unknown) {
    console.error('Error fetching KPI data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during KPI data fetch',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
