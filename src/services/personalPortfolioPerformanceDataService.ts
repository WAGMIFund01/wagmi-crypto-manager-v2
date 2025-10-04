// Personal portfolio performance data service
// Fetches data from the Personal portfolio historical sheet

import { PersonalPortfolioPerformanceData } from '@/shared/types/performance';

// Fallback data for when API is unavailable
const fallbackData: PersonalPortfolioPerformanceData[] = [
  {
    month: 'Oct-2024',
    endingAUM: 6264.09,
    personalMoM: 28.5,
    totalMoM: 11.59,
    total3MoM: 3.75,
    personalCumulative: 28.5,
    totalCumulative: 11.59,
    total3Cumulative: 3.75
  }
];

export async function fetchPersonalPortfolioPerformanceData(): Promise<PersonalPortfolioPerformanceData[]> {
  try {
    const response = await fetch('/api/get-personal-portfolio-performance-data');
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      console.error('Failed to fetch personal portfolio performance data:', result.error);
      // Fallback to minimal data if API fails
      return fallbackData;
    }
  } catch (error) {
    console.error('Error fetching personal portfolio performance data from API:', error);
    // Fallback to minimal data if API fails
    return fallbackData;
  }
}

// Helper function to get the latest performance data
export function getLatestPersonalPortfolioPerformanceData(data: PersonalPortfolioPerformanceData[]): PersonalPortfolioPerformanceData | null {
  if (data.length === 0) return null;
  return data[data.length - 1];
}

// Helper function to calculate year-to-date performance
export function getPersonalPortfolioYearToDatePerformance(data: PersonalPortfolioPerformanceData[]): { personal: number; total: number; total3: number } {
  const currentYear = new Date().getFullYear();
  const yearStartData = data.find(item => 
    item.month.includes(currentYear.toString()) && item.month.includes('Jan')
  );
  
  if (!yearStartData) {
    return { personal: 0, total: 0, total3: 0 };
  }
  
  const latestData = getLatestPersonalPortfolioPerformanceData(data);
  if (!latestData) {
    return { personal: 0, total: 0, total3: 0 };
  }
  
  return {
    personal: latestData.personalCumulative - yearStartData.personalCumulative,
    total: latestData.totalCumulative - yearStartData.totalCumulative,
    total3: latestData.total3Cumulative - yearStartData.total3Cumulative
  };
}

