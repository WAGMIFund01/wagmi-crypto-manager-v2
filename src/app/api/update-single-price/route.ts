import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';
import { config } from '@/lib/config';

export async function POST() {
  try {
    // Step 1: Fetch AURA price from CoinGecko
    const coinGeckoResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=aura-network&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
          ...(config.coinGeckoApiKey && { 'x-cg-demo-api-key': config.coinGeckoApiKey }),
        },
      }
    );

    if (!coinGeckoResponse.ok) {
      throw new Error(`CoinGecko API error: ${coinGeckoResponse.status}`);
    }

    const priceData = await coinGeckoResponse.json();
    const newPrice = priceData['aura-network']?.usd;

    if (newPrice === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Could not fetch AURA price from CoinGecko'
      }, { status: 502 });
    }

    // Step 2: Use new SheetsAdapter method to update AURA price
    // For now, we'll use a placeholder 24h change (this would normally come from CoinGecko)
    const priceChange24h = 0; // This should be fetched from CoinGecko in a real implementation
    
    await sheetsAdapter.updateAssetPrice('AURA', newPrice, priceChange24h, false); // false = WAGMI Fund

    return NextResponse.json({
      success: true,
      message: 'Successfully updated AURA price using SheetsAdapter',
      asset: 'AURA',
      newPrice: newPrice,
      priceChange24h: priceChange24h,
      timestamp: new Date().toISOString(),
      source: 'SheetsAdapter.updateAssetPrice()'
    });

  } catch (error) {
    console.error('Price update error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Single price update endpoint - use POST to update AURA price',
    usage: 'POST to this endpoint to test updating AURA price from CoinGecko'
  });
}
