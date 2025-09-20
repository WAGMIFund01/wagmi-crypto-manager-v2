import { 
  CoinGeckoSimplePriceRequest, 
  CoinGeckoSimplePriceResponse, 
  CoinGeckoError,
  CoinGeckoApiConfig 
} from '../types/coinGecko';

/**
 * Service for interacting with CoinGecko API
 */
export class CoinGeckoService {
  private config: CoinGeckoApiConfig;

  constructor(config: Partial<CoinGeckoApiConfig> = {}) {
    this.config = {
      baseUrl: 'https://api.coingecko.com/api/v3',
      rateLimitDelay: 1000,
      maxRetries: 3,
      ...config
    };
  }

  /**
   * Fetch prices for multiple cryptocurrencies
   */
  async getPrices(
    coinGeckoIds: string[], 
    include24hChange: boolean = true
  ): Promise<CoinGeckoSimplePriceResponse> {
    if (coinGeckoIds.length === 0) {
      return {};
    }

    const request: CoinGeckoSimplePriceRequest = {
      ids: coinGeckoIds,
      vs_currencies: ['usd'],
      include_24hr_change: include24hChange,
      include_last_updated_at: true
    };

    const url = this.buildUrl('/simple/price', request);
    
    try {
      const response = await this.makeRequest(url);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as CoinGeckoSimplePriceResponse;
    } catch (error) {
      console.error('CoinGecko API request failed:', error);
      throw new Error(`Failed to fetch prices from CoinGecko: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch price for a single cryptocurrency
   */
  async getPrice(coinGeckoId: string, include24hChange: boolean = true): Promise<CoinGeckoSimplePriceResponse> {
    return this.getPrices([coinGeckoId], include24hChange);
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params: Record<string, any>): string {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        url.searchParams.append(key, value.join(','));
      } else if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    return url.toString();
  }

  /**
   * Make HTTP request with retry logic and rate limiting
   */
  private async makeRequest(url: string, retryCount: number = 0): Promise<Response> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'WAGMI-Crypto-Manager/1.0'
    };

    if (this.config.apiKey) {
      headers['x-cg-demo-api-key'] = this.config.apiKey;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        // Add timeout
        signal: AbortSignal.timeout(10000)
      });

      // Handle rate limiting
      if (response.status === 429) {
        if (retryCount < this.config.maxRetries!) {
          console.log(`Rate limited, waiting ${this.config.rateLimitDelay}ms before retry ${retryCount + 1}`);
          await this.delay(this.config.rateLimitDelay!);
          return this.makeRequest(url, retryCount + 1);
        } else {
          throw new Error('Rate limit exceeded, max retries reached');
        }
      }

      return response;
    } catch (error) {
      if (retryCount < this.config.maxRetries! && this.isRetryableError(error)) {
        console.log(`Request failed, retrying in ${this.config.rateLimitDelay}ms (attempt ${retryCount + 1})`);
        await this.delay(this.config.rateLimitDelay!);
        return this.makeRequest(url, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error.name === 'AbortError') return false;
    if (error.message?.includes('Rate limit')) return true;
    if (error.message?.includes('timeout')) return true;
    return false;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate CoinGecko ID format
   */
  static validateCoinGeckoId(coinGeckoId: string): boolean {
    if (!coinGeckoId || typeof coinGeckoId !== 'string') return false;
    if (coinGeckoId.length < 2) return false;
    if (coinGeckoId.includes(' ')) return false;
    return true;
  }
}
