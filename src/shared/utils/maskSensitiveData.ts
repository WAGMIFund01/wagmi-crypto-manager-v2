/**
 * Masks sensitive data for privacy mode
 * @param value - The value to mask
 * @param isEnabled - Whether privacy mode is enabled
 * @returns Masked value or original value
 */
export function maskSensitiveData(value: string | number, isEnabled: boolean): string {
  if (!isEnabled) {
    return String(value);
  }
  
  // For numbers, show bullets based on length
  if (typeof value === 'number') {
    const length = String(value).length;
    return '•'.repeat(Math.max(3, Math.min(length, 8)));
  }
  
  // For strings, show bullets based on length
  const length = value.length;
  return '•'.repeat(Math.max(3, Math.min(length, 8)));
}

/**
 * Formats currency values with proper masking
 * @param value - The numeric value
 * @param isEnabled - Whether privacy mode is enabled
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, isEnabled: boolean = false): string {
  if (isEnabled) {
    return maskSensitiveData(value, true);
  }
  
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Formats percentage values with proper masking
 * @param value - The percentage value
 * @param isEnabled - Whether privacy mode is enabled
 * @param showSign - Whether to show +/- sign
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, isEnabled: boolean = false, showSign: boolean = false): string {
  if (isEnabled) {
    return maskSensitiveData(value, true);
  }
  
  const formatted = `${value.toFixed(1)}%`;
  return showSign ? (value >= 0 ? `+${formatted}` : formatted) : formatted;
}
