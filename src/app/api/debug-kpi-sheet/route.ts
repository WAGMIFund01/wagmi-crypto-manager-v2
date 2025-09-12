import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Google Sheet ID for WAGMI Investment Manager Database
    const SHEET_ID = '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

    // Fetch KPI data directly from Google Sheets using public API
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
      return NextResponse.json({
        success: false,
        error: `HTTP error: ${response.status} ${response.statusText}`
      }, { status: 500 });
    }

    const text = await response.text();
    
    // Parse the Google Sheets response (it's wrapped in a callback)
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonMatch) {
      return NextResponse.json({
        success: false,
        error: 'Invalid response format from Google Sheets'
      }, { status: 500 });
    }
    
    const data = JSON.parse(jsonMatch[1]);
    
    if (!data.table || !data.table.rows) {
      return NextResponse.json({
        success: false,
        error: 'No data found in KPIs sheet'
      }, { status: 500 });
    }

    // Extract all rows for debugging
    const rows = data.table.rows;
    const debugRows = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.c && row.c.length >= 2) {
        const metricName = row.c[0]?.v; // Column A - Metric Name
        const value = row.c[1]?.v; // Column B - Value
        
        debugRows.push({
          rowIndex: i,
          metricName: metricName,
          value: value,
          valueType: typeof value,
          isLastUpdated: metricName && metricName.toString().toLowerCase().trim() === 'last updated'
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      debugRows: debugRows,
      rawData: data
    });

  } catch (error) {
    console.error('Error in debug-kpi-sheet:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
