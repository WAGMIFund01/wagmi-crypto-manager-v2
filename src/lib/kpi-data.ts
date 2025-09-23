/**
 * Server-side KPI data fetching utility
 * This runs on the server, eliminating client-side load time
 */

import { unstable_cache } from 'next/cache';

export interface KPIData {
  totalInvestors: number;
  totalInvested: number;
  totalAUM: number;
  cumulativeReturn: number;
  monthlyReturn: number;
  lastUpdated: string; // Timestamp from Google Sheets
}

// Create a cached version of KPI data fetching
const getCachedKPIData = unstable_cache(
  async (forceRefresh: boolean = false) => {
    try {
      // Google Sheet ID for WAGMI Investment Manager Database
      const SHEET_ID = '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

      // Add cache-busting parameter when force refresh is requested
      const cacheBuster = forceRefresh ? `&_t=${Date.now()}` : '';
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=KPIs&tqx=out:json${cacheBuster}`;

      console.log('🔍 DEBUG - fetchKPIData called with forceRefresh:', forceRefresh, 'URL:', url);

      // Fetch KPI data directly from Google Sheets using public API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // Add cache control headers for force refresh
          ...(forceRefresh && {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          })
        }
      });

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
        
        // Special handling for "Last Updated" - check if this is the metric name row
        if (metricName && metricName.toString().toLowerCase().trim() === 'last updated') {
          console.log('🔍 DEBUG - Found "Last Updated" metric name row!');
          
          // Check if the value is in the next row (common pattern in this sheet)
          if (i + 1 < rows.length) {
            const nextRow = rows[i + 1];
            const nextRowValue = nextRow.c && nextRow.c.length >= 2 ? nextRow.c[1]?.v : null;
            console.log(`🔍 DEBUG - Next row value: "${nextRowValue}", type: ${typeof nextRowValue}`);
            
            if (nextRowValue !== undefined && nextRowValue !== null && nextRowValue !== '') {
              kpiData.lastUpdated = nextRowValue.toString();
              console.log('🔍 DEBUG - Using next row value for lastUpdated:', kpiData.lastUpdated);
              i++; // Skip the next row since we've processed it
              continue;
            }
          }
          
          // Fallback to current row value if next row doesn't have it
          if (value !== undefined && value !== null && value !== '') {
            kpiData.lastUpdated = value.toString();
            console.log('🔍 DEBUG - Using current row value for lastUpdated:', kpiData.lastUpdated);
          }
          continue;
        }
        
        if (metricName && value !== undefined && value !== '') {
          // Map the metric names to our expected format
          const cleanMetricName = metricName.toString().toLowerCase().trim();
          console.log(`🔍 DEBUG - Processing metric: "${cleanMetricName}" with value: "${value}"`);
          
          switch (cleanMetricName) {
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

      console.log('🔍 DEBUG - Final KPI data object:', kpiData);
      console.log('🔍 DEBUG - lastUpdated value:', kpiData.lastUpdated, 'Type:', typeof kpiData.lastUpdated);
      return kpiData;

    } catch (error) {
      console.error('Error fetching KPI data on server:', error);
      return null;
    }
  },
  ['kpi-data'],
  {
    tags: ['kpi-data'],
    revalidate: 60 // 60 seconds
  }
);

export async function fetchKPIData(forceRefresh: boolean = false): Promise<KPIData | null> {
  return await getCachedKPIData(forceRefresh);
}

// No fallback data - errors should be displayed instead of hidden
