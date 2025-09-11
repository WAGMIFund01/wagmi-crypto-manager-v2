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
  
  // Standardized masking: always use exactly 5 white dots
  return '•••••';
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
  
  // Format with commas for thousands separators and 2 decimal places
  return `$${value.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
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
