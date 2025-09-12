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
            case 'last updated':
              kpiData.lastUpdated = value.toString();
              console.log('Timestamp from Google Sheets:', value, 'Type:', typeof value);
              break;
          }
        }
      }
    }

    // If we didn't find the timestamp in the "Last Updated" row, try to find it in any row
    if (!kpiData.lastUpdated) {
      for (const row of rows) {
        if (row.c && row.c.length >= 2) {
          const metricName = row.c[0]?.v;
          const value = row.c[1]?.v;
          
          // Look for any row that contains "last updated" in the metric name
          if (metricName && metricName.toString().toLowerCase().includes('last updated') && value) {
            kpiData.lastUpdated = value.toString();
            console.log('Found timestamp in row with metric:', metricName, 'Value:', value);
            break;
          }
        }
      }
    }

    // If still no timestamp found, try to fetch it directly from cell B7
    if (!kpiData.lastUpdated) {
      try {
        const timestampResponse = await fetch(
          `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=KPIs&tqx=out:json&range=B7:B7`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            next: { revalidate: 60 }
          }
        );

        if (timestampResponse.ok) {
          const timestampText = await timestampResponse.text();
          const timestampJsonMatch = timestampText.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
          
          if (timestampJsonMatch) {
            const timestampData = JSON.parse(timestampJsonMatch[1]);
            if (timestampData.table && timestampData.table.rows && timestampData.table.rows.length > 0) {
              const timestampValue = timestampData.table.rows[0].c?.[0]?.v;
              if (timestampValue) {
                kpiData.lastUpdated = timestampValue.toString();
                console.log('Found timestamp in B7:', timestampValue);
              }
            }
          }
        }
      } catch (timestampError) {
        console.error('Error fetching timestamp from B7:', timestampError);
      }
    }

    console.log('Server-side KPI data fetched:', kpiData);
    return kpiData;

  } catch (error) {
    console.error('Error fetching KPI data on server:', error);
    return null;
  }
}

// No fallback data - errors should be displayed instead of hidden