/**
 * Pricing module exports
 */

// Services
export { PriceService } from './services/PriceService';
export { CoinGeckoService } from './services/CoinGeckoService';

// Hooks
export { usePriceUpdates } from './hooks/usePriceUpdates';
export { usePriceHistory } from './hooks/usePriceHistory';

// Components
export { 
  PriceDisplay, 
  PriceChangeIndicator, 
  PriceCard 
} from './components/PriceDisplay';
export { 
  PriceUpdateButton, 
  PriceUpdateStatus 
} from './components/PriceUpdateButton';

// Types
export type {
  PriceData,
  CoinGeckoPriceResponse,
  AssetPriceInfo,
  PriceUpdateResult,
  PriceUpdateError,
  BatchPriceUpdate,
  PriceUpdateSummary,
  PriceServiceConfig
} from './types/pricing';

export type {
  CoinGeckoSimplePriceRequest,
  CoinGeckoSimplePriceResponse,
  CoinGeckoError,
  CoinGeckoApiConfig
} from './types/coinGecko';

// Utils
export {
  calculatePriceChange,
  calculate24hChange,
  formatPrice,
  formatPercentageChange,
  calculatePortfolioValueChange,
  calculateAssetValue,
  calculateWeightedAveragePrice,
  calculateVolatility
} from './utils/priceCalculations';

export {
  formatPrice as formatPriceDisplay,
  formatPercentageChange as formatPercentageChangeDisplay,
  formatLargeNumber,
  formatTimestamp,
  formatPriceChangeWithColor,
  formatAssetSymbol,
  formatCoinGeckoId
} from './utils/priceFormatters';
