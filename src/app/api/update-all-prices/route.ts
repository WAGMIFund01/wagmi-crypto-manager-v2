import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Complete mapping for all supported assets
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'AURA': 'aura-network',
  'ETH': 'ethereum',
  'JITOSOL': 'jito-staked-sol',
  'SOL': 'solana',
  'JUP': 'jupiter-exchange-solana',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'BTC': 'bitcoin',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'ATOM': 'cosmos',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'AAVE': 'aave',
  'CRV': 'curve-dao-token',
  'COMP': 'compound-governance-token',
  'MKR': 'maker',
  'SNX': 'havven',
  'YFI': 'yearn-finance',
  'SUSHI': 'sushi',
  '1INCH': '1inch',
  'BAL': 'balancer',
  'LDO': 'lido-dao',
  'RPL': 'rocket-pool',
  'FXS': 'frax-share',
  'CVX': 'convex-finance',
  'FRAX': 'frax',
  'LUSD': 'liquity-usd',
  'GUSD': 'gemini-dollar',
  'SUSD': 'nusd',
  'DAI': 'dai',
  'BUSD': 'binance-usd',
  'TUSD': 'true-usd',
  'USDP': 'paxos-standard',
  'HUSD': 'husd',
  'USDN': 'neutrino-usd',
  'USDK': 'usdk',
  'USDS': 'stableusd'
};

export async function POST(request: NextRequest) {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID || '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

    if (!serviceAccountEmail || !privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Google Sheets API credentials'
      }, { status: 503 });
    }

    // Create authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Step 1: Read current portfolio data
    const portfolioResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Portfolio Overview!A:J',
    });

    const rows = portfolioResponse.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'No data found in Portfolio Overview sheet'
      }, { status: 404 });
    }

    // Step 2: Extract unique symbols that have quantity > 0 and are supported
    const symbolsToUpdate = new Set<string>();
    const assetRows: { symbol: string; rowIndex: number; quantity: number }[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const symbol = row[1]?.toString().toUpperCase();
      const quantity = parseFloat(row[6]?.toString()) || 0;

      if (symbol && quantity > 0 && SYMBOL_TO_COINGECKO_ID[symbol]) {
        symbolsToUpdate.add(symbol);
        assetRows.push({ symbol, rowIndex: i, quantity });
      }
    }

    if (symbolsToUpdate.size === 0) {
      return NextResponse.json({
        success: true,
        message: 'No assets found with quantity > 0 and supported symbols',
        updatedCount: 0
      });
    }

    // Step 3: Fetch prices from CoinGecko
    const coinGeckoIds = Array.from(symbolsToUpdate)
      .map(symbol => SYMBOL_TO_COINGECKO_ID[symbol])
      .join(',');

    const priceResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!priceResponse.ok) {
      throw new Error(`CoinGecko API error: ${priceResponse.status}`);
    }

    const priceData = await priceResponse.json();
    const currentTimestamp = new Date().toISOString();

    // Step 4: Prepare batch updates
    const updates: { range: string; values: (string | number)[][] }[] = [];
    let updatedCount = 0;

    for (const asset of assetRows) {
      const coinGeckoId = SYMBOL_TO_COINGECKO_ID[asset.symbol];
      const newPrice = priceData[coinGeckoId]?.usd;

      if (newPrice !== undefined) {
        const rowNum = asset.rowIndex + 1; // Google Sheets is 1-indexed
        const currentPriceRange = `Portfolio Overview!H${rowNum}`;
        const lastUpdateRange = `Portfolio Overview!J${rowNum}`;

        updates.push({
          range: currentPriceRange,
          values: [[newPrice]]
        });
        updates.push({
          range: lastUpdateRange,
          values: [[currentTimestamp]]
        });
        updatedCount++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No prices to update',
        updatedCount: 0
      });
    }

    // Step 5: Execute batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} assets`,
      updatedCount,
      timestamp: currentTimestamp,
      updatedAssets: assetRows.map(asset => ({
        symbol: asset.symbol,
        newPrice: priceData[SYMBOL_TO_COINGECKO_ID[asset.symbol]]?.usd
      }))
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
    message: 'Full price update endpoint - use POST to update all asset prices',
    usage: 'POST to this endpoint to update all supported asset prices from CoinGecko',
    supportedAssets: Object.keys(SYMBOL_TO_COINGECKO_ID)
  });
}
