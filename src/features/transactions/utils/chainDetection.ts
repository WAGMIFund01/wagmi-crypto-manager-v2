/**
 * Utility for automatically detecting blockchain chain based on coin selection
 */

export interface ChainInfo {
  name: string;
  displayName: string;
  color: string;
}

export const CHAIN_MAPPINGS: Record<string, ChainInfo> = {
  // Bitcoin
  'bitcoin': { name: 'Bitcoin', displayName: 'Bitcoin', color: '#F7931A' },
  'btc': { name: 'Bitcoin', displayName: 'Bitcoin', color: '#F7931A' },
  
  // Ethereum
  'ethereum': { name: 'Ethereum', displayName: 'Ethereum', color: '#627EEA' },
  'eth': { name: 'Ethereum', displayName: 'Ethereum', color: '#627EEA' },
  
  // Solana
  'solana': { name: 'Solana', displayName: 'Solana', color: '#9945FF' },
  'sol': { name: 'Solana', displayName: 'Solana', color: '#9945FF' },
  
  // Binance Smart Chain
  'binancecoin': { name: 'BSC', displayName: 'Binance Smart Chain', color: '#F3BA2F' },
  'bnb': { name: 'BSC', displayName: 'Binance Smart Chain', color: '#F3BA2F' },
  
  // Polygon
  'matic-network': { name: 'Polygon', displayName: 'Polygon', color: '#8247E5' },
  'polygon': { name: 'Polygon', displayName: 'Polygon', color: '#8247E5' },
  'matic': { name: 'Polygon', displayName: 'Polygon', color: '#8247E5' },
  
  // Avalanche
  'avalanche-2': { name: 'Avalanche', displayName: 'Avalanche', color: '#E84142' },
  'avalanche': { name: 'Avalanche', displayName: 'Avalanche', color: '#E84142' },
  'avax': { name: 'Avalanche', displayName: 'Avalanche', color: '#E84142' },
  
  // Cardano
  'cardano': { name: 'Cardano', displayName: 'Cardano', color: '#0033AD' },
  'ada': { name: 'Cardano', displayName: 'Cardano', color: '#0033AD' },
  
  // Polkadot
  'polkadot': { name: 'Polkadot', displayName: 'Polkadot', color: '#E6007A' },
  'dot': { name: 'Polkadot', displayName: 'Polkadot', color: '#E6007A' },
  
  // Chainlink
  'chainlink': { name: 'Ethereum', displayName: 'Ethereum', color: '#627EEA' },
  'link': { name: 'Ethereum', displayName: 'Ethereum', color: '#627EEA' },
  
  // Uniswap
  'uniswap': { name: 'Ethereum', displayName: 'Ethereum', color: '#627EEA' },
  'uni': { name: 'Ethereum', displayName: 'Ethereum', color: '#627EEA' },
  
  // Default fallback
  'default': { name: 'Unknown', displayName: 'Unknown Chain', color: '#666666' }
};

/**
 * Detect chain information based on coin ID or symbol
 */
export function detectChain(coinId?: string, symbol?: string): ChainInfo {
  if (!coinId && !symbol) {
    return CHAIN_MAPPINGS.default;
  }

  // Try by coin ID first (more specific)
  if (coinId) {
    const chainByCoinId = CHAIN_MAPPINGS[coinId.toLowerCase()];
    if (chainByCoinId) {
      return chainByCoinId;
    }
  }

  // Try by symbol
  if (symbol) {
    const chainBySymbol = CHAIN_MAPPINGS[symbol.toLowerCase()];
    if (chainBySymbol) {
      return chainBySymbol;
    }
  }

  // Return default if no match found
  return CHAIN_MAPPINGS.default;
}

/**
 * Get all available chains for dropdown
 */
export function getAllChains(): ChainInfo[] {
  const uniqueChains = new Map<string, ChainInfo>();
  
  Object.values(CHAIN_MAPPINGS).forEach(chain => {
    if (chain.name !== 'Unknown') {
      uniqueChains.set(chain.name, chain);
    }
  });

  return Array.from(uniqueChains.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
}
