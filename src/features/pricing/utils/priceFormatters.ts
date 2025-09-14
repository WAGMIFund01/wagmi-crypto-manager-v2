/**
 * Price formatting utilities
 */

export interface PriceFormatOptions {
  currency?: string;
  decimals?: number;
  showSign?: boolean;
  compact?: boolean;
}

/**
 * Format price with various options
 */
export function formatPrice(
  price: number, 
  options: PriceFormatOptions = {}
): string {
  const {
    currency = 'USD',
    decimals = 2,
    compact = false
  } = options;

  if (compact && price >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(price);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(price);
}

/**
 * Format percentage change
 */
export function formatPercentageChange(
  percentage: number, 
  options: PriceFormatOptions = {}
): string {
  const {
    decimals = 2,
    showSign = true
  } = options;

  const sign = showSign && percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(decimals)}%`;
}

/**
 * Format large numbers (e.g., market cap, volume)
 */
export function formatLargeNumber(
  number: number, 
  options: PriceFormatOptions = {}
): string {
  const {
    currency,
    decimals = 1
  } = options;

  if (currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: decimals
    }).format(number);
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: decimals
  }).format(number);
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(
  timestamp: string | Date, 
  options: { 
    format?: 'relative' | 'absolute';
    timezone?: string;
  } = {}
): string {
  const {
    format = 'relative',
    timezone = 'UTC'
  } = options;

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { timeZone: timezone });
    }
  }

  return date.toLocaleString('en-US', { 
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format price change with color coding
 */
export function formatPriceChangeWithColor(
  change: number, 
  options: PriceFormatOptions = {}
): { text: string; color: string } {
  const text = formatPercentageChange(change, options);
  const color = change >= 0 ? 'text-green-600' : 'text-red-600';
  
  return { text, color };
}

/**
 * Format asset symbol for display
 */
export function formatAssetSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

/**
 * Format CoinGecko ID for display
 */
export function formatCoinGeckoId(coinGeckoId: string): string {
  return coinGeckoId.toLowerCase().replace(/\s+/g, '-');
}
