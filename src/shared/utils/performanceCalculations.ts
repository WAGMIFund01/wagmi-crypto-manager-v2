/**
 * Performance calculation utilities
 * Used for portfolio peak ratio and LP performance calculations
 */

export interface HistoricalPerformanceData {
  month: string;
  endingAUM: number;
  [key: string]: any; // Allow for additional fields
}

export interface LPMetrics {
  initialDeposit: number;
  currentValue: number;
  yieldGenerated: number;
  spotValue: number;
  capitalAppreciation: number;
  totalReturn: number;
  roi: number;
  oppCostDelta: number;
  oppCostRatio: number;
}

/**
 * Calculate the peak portfolio value from historical data
 * @param historicalData Array of historical performance data
 * @returns The maximum endingAUM value found
 */
export function calculatePeakValue(historicalData: HistoricalPerformanceData[]): number {
  if (!historicalData || historicalData.length === 0) {
    return 0;
  }

  return Math.max(...historicalData.map(data => data.endingAUM || 0));
}

/**
 * Calculate portfolio peak ratio
 * @param currentValue Current portfolio value
 * @param peakValue Peak portfolio value from historical data
 * @returns Object with ratio percentage and distance to peak
 */
export function calculatePeakRatio(currentValue: number, peakValue: number) {
  if (peakValue === 0) {
    return {
      ratio: 0,
      distanceToPeak: 0
    };
  }

  const ratio = Math.min((currentValue / peakValue) * 100, 100);
  const distanceToPeak = Math.max(0, peakValue - currentValue);

  return {
    ratio: Math.round(ratio),
    distanceToPeak
  };
}

/**
 * Calculate LP performance metrics
 * @param initialDeposit Initial deposit amount
 * @param currentValue Current LP position value
 * @param yieldGenerated Realized yield/fees
 * @param spotValue HODL value (if held instead of LP)
 * @returns Calculated LP metrics
 */
export function calculateLPMetrics(
  initialDeposit: number,
  currentValue: number,
  yieldGenerated: number,
  spotValue: number
): LPMetrics {
  const capitalAppreciation = currentValue - initialDeposit;
  const totalReturn = capitalAppreciation + yieldGenerated;
  const roi = initialDeposit > 0 ? (totalReturn / initialDeposit) * 100 : 0;
  const oppCostDelta = currentValue - spotValue;
  const oppCostRatio = spotValue > 0 ? (currentValue / spotValue) * 100 : 0;

  return {
    initialDeposit,
    currentValue,
    yieldGenerated,
    spotValue,
    capitalAppreciation,
    totalReturn,
    roi: Math.round(roi),
    oppCostDelta,
    oppCostRatio: Math.round(oppCostRatio)
  };
}

/**
 * Format ROI as whole number percentage
 * @param value ROI value (0-100)
 * @returns Formatted percentage string
 */
export function formatROI(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Calculate spot value from opportunity cost
 * @param opportunityCost Opportunity cost delta
 * @param currentValue Current LP value
 * @returns Calculated spot value
 */
export function calculateSpotValue(opportunityCost: number, currentValue: number): number {
  return currentValue - opportunityCost;
}
