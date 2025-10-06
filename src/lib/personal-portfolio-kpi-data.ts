import { sheetsAdapter } from './sheetsAdapter';

export async function fetchPersonalPortfolioKPIData() {
  try {
    console.log('🔍 Fetching Personal Portfolio KPI data via sheetsAdapter...');
    const data = await sheetsAdapter.getPersonalPortfolioKpiFromKpisTab();
    console.log('✅ Personal Portfolio KPI data fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching personal portfolio KPI data:', error);
    return null;
  }
}
