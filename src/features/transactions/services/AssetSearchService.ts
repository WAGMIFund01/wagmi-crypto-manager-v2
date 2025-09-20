/**
 * Service for searching and retrieving asset information from CoinGecko API
 */

export interface AssetSearchResult {
  id: string;
  symbol: string;
  name: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  market_cap?: number;
  image?: string;
  thumb?: string;
}

export interface AssetSearchOptions {
  query: string;
  limit?: number;
}

export class AssetSearchService {
  private baseUrl: string = 'https://api.coingecko.com/api/v3';

  /**
   * Search for assets by name or symbol
   */
  async searchAssets(options: AssetSearchOptions): Promise<AssetSearchResult[]> {
    const { query, limit = 20 } = options;

    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`CoinGecko search API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.coins || !Array.isArray(data.coins)) {
        return [];
      }

      // Map and filter results
      const results: AssetSearchResult[] = data.coins
        .slice(0, limit)
        .map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol?.toUpperCase() || '',
          name: coin.name || '',
          image: coin.thumb || coin.large || coin.small,
          thumb: coin.thumb
        }))
        .filter((coin: AssetSearchResult) => 
          coin.id && coin.symbol && coin.name
        );

      return results;
    } catch (error) {
      console.error('Error searching assets:', error);
      throw new Error('Failed to search for assets');
    }
  }

  /**
   * Get detailed asset information including current price
   */
  async getAssetDetails(coinGeckoId: string): Promise<AssetSearchResult | null> {
    try {
      const url = `${this.baseUrl}/coins/${coinGeckoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        symbol: data.symbol?.toUpperCase() || '',
        name: data.name || '',
        current_price: data.market_data?.current_price?.usd,
        price_change_percentage_24h: data.market_data?.price_change_percentage_24h,
        market_cap: data.market_data?.market_cap?.usd,
        image: data.image?.thumb || data.image?.small,
        thumb: data.image?.thumb
      };
    } catch (error) {
      console.error('Error fetching asset details:', error);
      return null;
    }
  }

  /**
   * Get trending/popular assets
   */
  async getTrendingAssets(): Promise<AssetSearchResult[]> {
    try {
      const url = `${this.baseUrl}/search/trending`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`CoinGecko trending API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.coins || !Array.isArray(data.coins)) {
        return [];
      }

      return data.coins
        .slice(0, 10)
        .map((item: any) => {
          const coin = item.item;
          return {
            id: coin.id,
            symbol: coin.symbol?.toUpperCase() || '',
            name: coin.name || '',
            image: coin.thumb || coin.small,
            thumb: coin.thumb
          };
        })
        .filter((coin: AssetSearchResult) => 
          coin.id && coin.symbol && coin.name
        );
    } catch (error) {
      console.error('Error fetching trending assets:', error);
      return [];
    }
  }
}

// Export singleton instance
export const assetSearchService = new AssetSearchService();
