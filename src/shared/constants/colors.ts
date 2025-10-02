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
    defi: '#FF6B35',       // Orange for DeFi
    nft: '#EC4899',        // Pink for NFT
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

  // Location colors (wallets, platforms, exchanges)
  location: {
    'phantom wallet': '#9945FF',      // Solana purple
    'orca lp': '#00D1FF',             // Orca blue
    'metamask': '#F6851B',            // MetaMask orange
    'ledger': '#000000',              // Ledger black (will show as dark gray)
    'binance': '#F3BA2F',             // Binance yellow
    'coinbase': '#0052FF',            // Coinbase blue
    'kraken': '#5741D9',              // Kraken purple
    'raydium': '#C03FD5',             // Raydium purple
    'jupiter': '#00D4AA',             // Jupiter teal
    'drift': '#9945FF',               // Drift purple
    'marinade': '#FF5F00',            // Marinade orange
    'kamino': '#4CAF50',              // Kamino green
    'meteora': '#6366F1',             // Meteora indigo
    'uniswap': '#FF007A',             // Uniswap pink
    'curve': '#40649F',               // Curve blue
    'aave': '#B6509E',                // Aave purple
    default: '#6B7280',               // Gray for unknown locations
  },

  // Component theme colors
  theme: {
    green: {
      accent: '#00FF95',
      border: 'rgba(0, 255, 149, 0.1)',
      shadow: 'rgba(0, 255, 149, 0.1)',
      glow: 'rgba(0, 255, 149, 0.05)',
      outerGlow: 'rgba(0, 255, 149, 0.02)',
      focus: 'rgba(0, 255, 149, 0.3)',
    },
    orange: {
      accent: '#FF6B35',
      border: 'rgba(255, 107, 53, 0.1)',
      shadow: 'rgba(255, 107, 53, 0.1)',
      glow: 'rgba(255, 107, 53, 0.05)',
      outerGlow: 'rgba(255, 107, 53, 0.02)',
      focus: 'rgba(255, 107, 53, 0.3)',
    },
    blue: {
      accent: '#3B82F6',
      border: 'rgba(59, 130, 246, 0.1)',
      shadow: 'rgba(59, 130, 246, 0.1)',
      glow: 'rgba(59, 130, 246, 0.05)',
      outerGlow: 'rgba(59, 130, 246, 0.02)',
      focus: 'rgba(59, 130, 246, 0.3)',
    },
    purple: {
      accent: '#8B5CF6',
      border: 'rgba(139, 92, 246, 0.1)',
      shadow: 'rgba(139, 92, 246, 0.1)',
      glow: 'rgba(139, 92, 246, 0.05)',
      outerGlow: 'rgba(139, 92, 246, 0.02)',
      focus: 'rgba(139, 92, 246, 0.3)',
    },
    red: {
      accent: '#EF4444',
      border: 'rgba(239, 68, 68, 0.1)',
      shadow: 'rgba(239, 68, 68, 0.1)',
      glow: 'rgba(239, 68, 68, 0.05)',
      outerGlow: 'rgba(239, 68, 68, 0.02)',
      focus: 'rgba(239, 68, 68, 0.3)',
    },
    gray: {
      accent: '#6B7280',
      border: 'rgba(107, 114, 128, 0.1)',
      shadow: 'rgba(107, 114, 128, 0.1)',
      glow: 'rgba(107, 114, 128, 0.05)',
      outerGlow: 'rgba(107, 114, 128, 0.02)',
      focus: 'rgba(107, 114, 128, 0.3)',
    },
  },

  // Input component colors
  input: {
    bg: '#374151',
    border: '#4B5563',
    text: '#FFFFFF',
    placeholder: '#9CA3AF',
    error: '#EF4444',
    errorFocus: 'rgba(239, 68, 68, 0.3)',
  },

  // Modal colors
  modal: {
    overlay: 'rgba(0, 0, 0, 0.6)',
    content: 'rgba(26, 31, 26, 0.95)',
    border: 'rgba(255, 255, 255, 0.1)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },

  // Table colors
  table: {
    rowEven: 'transparent',
    rowOdd: 'rgba(255, 255, 255, 0.02)',
    hover: 'rgba(0, 255, 149, 0.05)',
    border: '#333',
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
