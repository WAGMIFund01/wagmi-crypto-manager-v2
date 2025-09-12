/**
 * Server-side KPI data fetching utility
 * This runs on the server, eliminating client-side load time
 */

export interface KPIData {
  totalInvestors: number;
  totalInvested: number;
  totalAUM: number;
  cumulativeReturn: number;
  monthlyReturn: number;
  lastUpdated: string; // Timestamp from Google Sheets
}

export async function fetchKPIData(): Promise<KPIData | null> {
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
        // Add cache control for better performance
        next: { revalidate: 60 } // Revalidate every 60 seconds
      }
    );

    if (!response.ok) {
      console.error('Google Sheets API HTTP error:', response.status, response.statusText);
      return null;
    }

    const text = await response.text();
    
    // Parse the Google Sheets response (it's wrapped in a callback)
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonMatch) {
      console.error('Invalid response format from Google Sheets');
      return null;
    }
    
    const data = JSON.parse(jsonMatch[1]);
    
    if (!data.table || !data.table.rows) {
      console.error('No data found in KPIs sheet');
      return null;
    }

    // Extract KPI data from the sheet
    const kpiData: KPIData = {
      totalInvestors: 0,
      totalInvested: 0,
      totalAUM: 0,
      cumulativeReturn: 0,
      monthlyReturn: 0,
      lastUpdated: ''
    };
    
    const rows = data.table.rows;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.c && row.c.length >= 2) {
        const metricName = row.c[0]?.v; // Column A - Metric Name
        const value = row.c[1]?.v; // Column B - Value
        
        console.log(`🔍 DEBUG - Row ${i}: metricName="${metricName}", value="${value}", type=${typeof value}`);
        
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
            case 'last updated':
              console.log('🔍 DEBUG - Found "Last Updated" row!');
              console.log('🔍 DEBUG - Raw timestamp from Google Sheets:', value, 'Type:', typeof value);
              kpiData.lastUpdated = value.toString();
              console.log('🔍 DEBUG - Parsed lastUpdated:', kpiData.lastUpdated);
              break;
          }
        }
      }
    }

    console.log('🔍 DEBUG - Final KPI data object:', kpiData);
    console.log('🔍 DEBUG - lastUpdated value:', kpiData.lastUpdated, 'Type:', typeof kpiData.lastUpdated);
    return kpiData;

  } catch (error) {
    console.error('Error fetching KPI data on server:', error);
    return null;
  }
}

// No fallback data - errors should be displayed instead of hidden
