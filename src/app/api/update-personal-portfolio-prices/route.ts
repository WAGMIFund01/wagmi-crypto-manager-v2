import { NextRequest, NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Personal Portfolio price update...');

    // Get Personal Portfolio data to find assets that need price updates
    const portfolioResponse = await fetch(`${request.nextUrl.origin}/api/get-personal-portfolio-data`);
    const portfolioData = await portfolioResponse.json();

    if (!portfolioData.success || !portfolioData.assets) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch Personal Portfolio data'
      }, { status: 404 });
    }

    const assets = portfolioData.assets;
    console.log(`Found ${assets.length} assets in Personal Portfolio`);

    // Process each asset and collect detailed information
    const assetDetails: {
      symbol: string;
      coinGeckoId: string | null;
      status: 'success' | 'no_coinGecko_id' | 'invalid_coinGecko_id' | 'coinGecko_error';
      error?: string;
      newPrice?: number;
      priceChange24h?: number;
    }[] = [];

    const coinGeckoIdsToFetch = new Set<string>();

    // Collect unique CoinGecko IDs
    for (const asset of assets) {
      const coinGeckoId = asset.coinGeckoId?.toString()?.trim();
      
      if (coinGeckoId) {
        coinGeckoIdsToFetch.add(coinGeckoId);
        
        assetDetails.push({
          symbol: asset.symbol,
          coinGeckoId,
          status: 'success'
        });
      } else {
        assetDetails.push({
          symbol: asset.symbol,
          coinGeckoId: null,
          status: 'no_coinGecko_id',
          error: 'No CoinGecko ID found'
        });
      }
    }

    console.log(`Found ${coinGeckoIdsToFetch.size} unique CoinGecko IDs to fetch`);

    // Fetch prices from CoinGecko API
    const coinGeckoPrices: { [key: string]: { price: number; priceChange24h: number } } = {};
    
    if (coinGeckoIdsToFetch.size > 0) {
      try {
        const coinGeckoIdsArray = Array.from(coinGeckoIdsToFetch);
        const coinGeckoResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIdsArray.join(',')}&vs_currencies=usd&include_24hr_change=true`
        );

        if (coinGeckoResponse.ok) {
          const coinGeckoData = await coinGeckoResponse.json();
          
          for (const [coinGeckoId, data] of Object.entries(coinGeckoData)) {
            if (data && typeof data === 'object' && 'usd' in data) {
              coinGeckoPrices[coinGeckoId] = {
                price: (data as any).usd,
                priceChange24h: (data as any).usd_24h_change || 0
              };
            }
          }
          
          console.log(`Successfully fetched prices for ${Object.keys(coinGeckoPrices).length} assets from CoinGecko`);
        } else {
          throw new Error(`CoinGecko API error: ${coinGeckoResponse.status}`);
        }
      } catch (error) {
        console.error('Error fetching prices from CoinGecko:', error);
        return NextResponse.json({
          success: false,
          error: `Failed to fetch prices from CoinGecko: ${error instanceof Error ? error.message : 'Unknown error'}`
        }, { status: 500 });
      }
    }

    // Update asset details with fetched prices
    for (const assetDetail of assetDetails) {
      if (assetDetail.coinGeckoId && coinGeckoPrices[assetDetail.coinGeckoId]) {
        const priceData = coinGeckoPrices[assetDetail.coinGeckoId];
        assetDetail.newPrice = priceData.price;
        assetDetail.priceChange24h = priceData.priceChange24h;
      } else if (assetDetail.coinGeckoId) {
        assetDetail.status = 'coinGecko_error';
        assetDetail.error = 'Price not found in CoinGecko response';
      }
    }

    // Update prices in Personal Portfolio sheet
    const updateResults = [];
    for (const assetDetail of assetDetails) {
      if (assetDetail.newPrice !== undefined) {
        try {
          // Update the asset with new price and 24hr change
          const updateResult = await sheetsAdapter.editPersonalAsset({
            symbol: assetDetail.symbol,
            currentPrice: assetDetail.newPrice,
            priceChange24h: assetDetail.priceChange24h || 0
          });
          
          updateResults.push({
            symbol: assetDetail.symbol,
            success: updateResult.success,
            error: updateResult.error
          });
          
          console.log(`Updated ${assetDetail.symbol}: $${assetDetail.newPrice} (${assetDetail.priceChange24h?.toFixed(2)}%)`);
        } catch (error) {
          console.error(`Failed to update ${assetDetail.symbol}:`, error);
          updateResults.push({
            symbol: assetDetail.symbol,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    const successfulUpdates = updateResults.filter(r => r.success).length;
    const failedUpdates = updateResults.filter(r => !r.success).length;

    console.log(`Personal Portfolio price update completed: ${successfulUpdates} successful, ${failedUpdates} failed`);

    return NextResponse.json({
      success: true,
      message: `Updated prices for ${successfulUpdates} assets`,
      details: {
        totalAssets: assets.length,
        successfulUpdates,
        failedUpdates,
        updateResults
      }
    });

  } catch (error) {
    console.error('Error updating Personal Portfolio prices:', error);
    return NextResponse.json({
      success: false,
      error: `Failed to update Personal Portfolio prices: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
