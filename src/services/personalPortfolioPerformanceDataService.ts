// Personal portfolio performance data service
// Fetches data from the Personal portfolio historical sheet

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

// Mock data based on the spreadsheet structure - this will be replaced by API data
const mockPersonalPortfolioPerformanceData: PersonalPortfolioPerformanceData[] = [
  {
    month: 'Oct-2024',
    endingAUM: 6264.09,
    personalMoM: 28.5,
    totalMoM: 11.59,
    total3MoM: 3.75,
    personalCumulative: 28.5,
    totalCumulative: 11.59,
    total3Cumulative: 3.75
  },
  {
    month: 'Nov-2024',
    endingAUM: 14478.56,
    personalMoM: 131.2,
    totalMoM: 40.69,
    total3MoM: 63.20,
    personalCumulative: 197.0,
    totalCumulative: 57.0,
    total3Cumulative: 69.2
  },
  {
    month: 'Dec-2024',
    endingAUM: 11270.77,
    personalMoM: -22.2,
    totalMoM: -4.13,
    total3MoM: -8.12,
    personalCumulative: 131.2,
    totalCumulative: 50.5,
    total3Cumulative: 55.4
  },
  {
    month: 'Jan-2025',
    endingAUM: 12845.23,
    personalMoM: 14.0,
    totalMoM: 8.5,
    total3MoM: 12.3,
    personalCumulative: 163.5,
    totalCumulative: 63.3,
    total3Cumulative: 74.5
  },
  {
    month: 'Feb-2025',
    endingAUM: 9205.67,
    personalMoM: -28.3,
    totalMoM: -12.1,
    total3MoM: -15.8,
    personalCumulative: 89.0,
    totalCumulative: 43.5,
    total3Cumulative: 46.9
  },
  {
    month: 'Mar-2025',
    endingAUM: 11567.89,
    personalMoM: 25.7,
    totalMoM: 18.2,
    total3MoM: 22.1,
    personalCumulative: 137.6,
    totalCumulative: 69.6,
    total3Cumulative: 79.4
  },
  {
    month: 'Apr-2025',
    endingAUM: 9876.54,
    personalMoM: -14.6,
    totalMoM: -8.9,
    total3MoM: -11.2,
    personalCumulative: 103.0,
    totalCumulative: 54.5,
    total3Cumulative: 59.3
  },
  {
    month: 'May-2025',
    endingAUM: 12987.65,
    personalMoM: 31.2,
    totalMoM: 22.8,
    total3MoM: 28.5,
    personalCumulative: 166.4,
    totalCumulative: 89.8,
    total3Cumulative: 104.7
  },
  {
    month: 'Jun-2025',
    endingAUM: 10876.43,
    personalMoM: -16.3,
    totalMoM: -9.5,
    total3MoM: -12.8,
    personalCumulative: 123.0,
    totalCumulative: 71.8,
    total3Cumulative: 78.5
  },
  {
    month: 'Jul-2025',
    endingAUM: 12456.78,
    personalMoM: 14.5,
    totalMoM: 11.2,
    total3MoM: 15.6,
    personalCumulative: 155.3,
    totalCumulative: 91.1,
    total3Cumulative: 106.3
  },
  {
    month: 'Aug-2025',
    endingAUM: 11234.56,
    personalMoM: -9.8,
    totalMoM: -6.2,
    total3MoM: -8.9,
    personalCumulative: 130.2,
    totalCumulative: 79.2,
    total3Cumulative: 88.0
  },
  {
    month: 'Sep-2025',
    endingAUM: 12345.67,
    personalMoM: 9.9,
    totalMoM: 7.8,
    total3MoM: 10.5,
    personalCumulative: 153.0,
    totalCumulative: 93.0,
    total3Cumulative: 107.8
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
      // Fallback to mock data if API fails
      return mockPersonalPortfolioPerformanceData;
    }
  } catch (error) {
    console.error('Error fetching personal portfolio performance data from API:', error);
    // Fallback to mock data if API fails
    return mockPersonalPortfolioPerformanceData;
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

