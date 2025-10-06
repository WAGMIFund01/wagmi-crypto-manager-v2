// Shared performance data types

export interface PerformanceData {
  month: string;
  endingAUM: number;
  wagmiMoM: number;
  totalMoM: number;
  total3MoM: number;
  wagmiCumulative: number;
  totalCumulative: number;
  total3Cumulative: number;
}

export interface PersonalPortfolioPerformanceData {
  month: string;
  endingAUM: number;
  personalMoM: number;
  totalMoM: number;
  total3MoM: number;
  personalCumulative: number;
  totalCumulative: number;
  total3Cumulative: number;
  investment: number;
}

export interface PerformanceDashboardData {
  summary: {
    totalOperations: number;
    averageDuration: number;
    errorRate: number;
    operations: Array<{
      operation: string;
      duration: number;
      timestamp: number;
      success: boolean;
    }>;
  };
  slowOperations: Array<{
    operation: string;
    duration: number;
    timestamp: number;
    success: boolean;
  }>;
  allMetrics: Array<{
    operation: string;
    duration: number;
    timestamp: number;
    success: boolean;
  }>;
}
