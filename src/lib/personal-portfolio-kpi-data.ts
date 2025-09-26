import { sheetsAdapter } from './sheetsAdapter';

export async function fetchPersonalPortfolioKPIData() {
  try {
    const data = await sheetsAdapter.getPersonalPortfolioKpiFromKpisTab();
    return data;
  } catch (error) {
    console.error('Error fetching personal portfolio KPI data:', error);
    return null;
  }
}
