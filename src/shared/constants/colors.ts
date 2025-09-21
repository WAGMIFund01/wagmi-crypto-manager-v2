/**
 * Centralized color scheme for the WAGMI application
 * This ensures consistent colors across all components
 */

export const COLORS = {
  // Primary brand colors
  primary: {
    green: '#00FF95',      // Main brand green
    greenHover: '#00E685', // Darker green for hover states
    greenLight: '#33FFAA', // Lighter green for accents
  },

  // Semantic colors
  semantic: {
    success: '#00FF95',    // Green for positive/success states
    error: '#FF4D4D',      // Red for errors/negative states
    warning: '#F59E0B',    // Orange for warnings
    info: '#3B82F6',       // Blue for informational states
  },

  // Background colors
  background: {
    primary: '#1A1F1A',    // Main dark background
    secondary: '#2A2A2A',  // Secondary dark background (table headers, etc.)
    tertiary: '#1F2937',   // Tertiary background
    overlay: 'rgba(0, 0, 0, 0.8)', // Modal overlay
  },

  // Text colors
  text: {
    primary: '#FFFFFF',    // Main text color
    secondary: '#A0A0A0',  // Secondary text color
    muted: '#6B7280',      // Muted text color
    accent: '#00FF95',     // Accent text color
  },

  // Border colors
  border: {
    primary: '#374151',    // Main border color
    secondary: '#4B5563',  // Secondary border color
    accent: '#00FF95',     // Accent border color
  },

  // Chart colors (for portfolio breakdowns)
  chart: {
    primary: '#00FF95',
    secondary: '#FF6B35',
    tertiary: '#3B82F6',
    quaternary: '#8B5CF6',
    quinary: '#F59E0B',
    senary: '#EF4444',
    septenary: '#10B981',
    octonary: '#F97316',
    nonary: '#6366F1',
    decenary: '#EC4899',
  },

  // Risk level colors
  risk: {
    high: '#EF4444',       // Red for high risk
    medium: '#F59E0B',     // Orange for medium risk
    low: '#10B981',        // Green for low risk
    degen: '#8B5CF6',      // Purple for degen risk
    none: '#6B7280',       // Gray for no risk
  },

  // Asset type colors
  assetType: {
    memecoin: '#8B5CF6',   // Purple for memecoin
    major: '#00FF95',      // Green for major coins
    altcoin: '#3B82F6',    // Blue for altcoins
    stablecoin: '#6B7280', // Gray for stablecoins
  },

  // Chain colors
  chain: {
    ethereum: '#627EEA',
    solana: '#9945FF',
    bitcoin: '#F7931A',
    polygon: '#8247E5',
    avalanche: '#E84142',
    fantom: '#1969FF',
    arbitrum: '#28A0F0',
    optimism: '#FF0420',
    base: '#0052FF',
    default: '#6B7280',
  },
} as const;

// Helper function to get conditional colors based on value
export const getConditionalColor = (value: number, positiveColor = COLORS.semantic.success, negativeColor = COLORS.semantic.error) => {
  return value >= 0 ? positiveColor : negativeColor;
};

// Helper function to get risk color
export const getRiskColor = (riskLevel: string): string => {
  const normalizedRisk = riskLevel.toLowerCase();
  return COLORS.risk[normalizedRisk as keyof typeof COLORS.risk] || COLORS.risk.none;
};

// Helper function to get asset type color
export const getAssetTypeColor = (assetType: string): string => {
  const normalizedType = assetType.toLowerCase();
  return COLORS.assetType[normalizedType as keyof typeof COLORS.assetType] || COLORS.assetType.altcoin;
};

// Helper function to get chain color
export const getChainColor = (chain: string): string => {
  const normalizedChain = chain.toLowerCase();
  return COLORS.chain[normalizedChain as keyof typeof COLORS.chain] || COLORS.chain.default;
};
