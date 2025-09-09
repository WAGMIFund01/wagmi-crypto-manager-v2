// Format currency with proper formatting rules
export const formatCurrency = (value: number, privacy: boolean) => {
  if (privacy) return '$•••';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format percentage with proper formatting rules
export const formatPercentage = (value: number, privacy: boolean, showSign: boolean = false) => {
  if (privacy) return '•••%';
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};
