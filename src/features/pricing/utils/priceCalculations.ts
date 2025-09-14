/**
 * Price calculation utilities
 */

export interface PriceChange {
  absolute: number;
  percentage: number;
  isPositive: boolean;
}

export interface PriceMetrics {
  currentPrice: number;
  previousPrice: number;
  change24h: PriceChange;
  changePercent: number;
}

/**
 * Calculate price change metrics
 */
export function calculatePriceChange(currentPrice: number, previousPrice: number): PriceChange {
  const absolute = currentPrice - previousPrice;
  const percentage = previousPrice > 0 ? (absolute / previousPrice) * 100 : 0;
  
  return {
    absolute,
    percentage,
    isPositive: absolute >= 0
  };
}

/**
 * Calculate 24hr price change percentage
 */
export function calculate24hChange(currentPrice: number, change24hPercent: number): number {
  return change24hPercent;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(price);
}

/**
 * Format percentage change for display
 */
export function formatPercentageChange(percentage: number, decimals: number = 2): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(decimals)}%`;
}

/**
 * Calculate portfolio value change
 */
export function calculatePortfolioValueChange(
  currentValue: number, 
  previousValue: number
): PriceChange {
  return calculatePriceChange(currentValue, previousValue);
}

/**
 * Calculate asset value from quantity and price
 */
export function calculateAssetValue(quantity: number, price: number): number {
  return quantity * price;
}

/**
 * Calculate weighted average price
 */
export function calculateWeightedAveragePrice(
  prices: number[], 
  weights: number[]
): number {
  if (prices.length !== weights.length) {
    throw new Error('Prices and weights arrays must have the same length');
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight === 0) {
    return 0;
  }

  const weightedSum = prices.reduce((sum, price, index) => {
    return sum + (price * weights[index]);
  }, 0);

  return weightedSum / totalWeight;
}

/**
 * Calculate price volatility (standard deviation of returns)
 */
export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) {
    return 0;
  }

  // Calculate returns
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const returnValue = (prices[i] - prices[i - 1]) / prices[i - 1];
    returns.push(returnValue);
  }

  // Calculate mean return
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;

  // Calculate variance
  const variance = returns.reduce((sum, ret) => {
    return sum + Math.pow(ret - meanReturn, 2);
  }, 0) / (returns.length - 1);

  // Return standard deviation (volatility)
  return Math.sqrt(variance);
}
