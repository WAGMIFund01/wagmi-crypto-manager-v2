/**
 * Server-side KPI data fetching utility
 * Uses authenticated Google Sheets API for reliability (mirrors Personal Portfolio approach)
 */

import { sheetsAdapter } from './sheetsAdapter';

export interface KPIData {
  totalInvestors: number;
  totalInvested: number;
  totalAUM: number;
  cumulativeReturn: number;
  monthlyReturn: number;
  lastUpdated: string; // Timestamp from Google Sheets
}

/**
 * Fetch WAGMI Fund KPI data using authenticated Google Sheets API
 * This approach is reliable and matches the Personal Portfolio implementation
 */
export async function fetchKPIData(): Promise<KPIData | null> {
  try {
    console.log('🔍 Fetching WAGMI Fund KPI data via sheetsAdapter...');
    const data = await sheetsAdapter.getKpiData();
    console.log('✅ KPI data fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching WAGMI Fund KPI data:', error);
    return null;
  }
}
