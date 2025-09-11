import { NextResponse } from 'next/server';

export interface PortfolioAsset {
  assetName: string;
  symbol: string;
  chain: string;
  riskLevel: string;
  location: string;
  coinType: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  lastPriceUpdate: string;
}

export async function GET() {
  try {
    // Google Sheet ID for WAGMI Investment Manager Database
    const SHEET_ID = '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

    // Fetch portfolio data directly from Google Sheets using public API
    try {
      // Use the public Google Sheets API to read the Portfolio Overview sheet
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Portfolio%20Overview&tqx=out:json`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Google Sheets API HTTP error:', response.status, response.statusText);
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      const text = await response.text();
      
      // Parse the Google Sheets response (it's wrapped in a callback)
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Google Sheets');
      }
      
      const data = JSON.parse(jsonMatch[1]);
      
      if (!data.table || !data.table.rows) {
        throw new Error('No data found in Portfolio Overview sheet');
      }

      // Extract portfolio data from the sheet
      const portfolioAssets: PortfolioAsset[] = [];
      const rows = data.table.rows;
      
      // Skip the header row (index 0) and process data rows
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.c && row.c.length >= 10) {
          const assetName = row.c[0]?.v?.toString() || '';
          const symbol = row.c[1]?.v?.toString() || '';
          const chain = row.c[2]?.v?.toString() || '';
          const riskLevel = row.c[3]?.v?.toString() || '';
          const location = row.c[4]?.v?.toString() || '';
          const coinType = row.c[5]?.v?.toString() || '';
          const quantity = parseFloat(row.c[6]?.v) || 0;
          const currentPrice = parseFloat(row.c[7]?.v) || 0;
          const totalValue = parseFloat(row.c[8]?.v) || 0;
          const lastPriceUpdate = row.c[9]?.v?.toString() || '';

          // Only add assets that have a name and symbol
          if (assetName && symbol) {
            portfolioAssets.push({
              assetName,
              symbol,
              chain,
              riskLevel,
              location,
              coinType,
              quantity,
              currentPrice,
              totalValue,
              lastPriceUpdate
            });
          }
        }
      }

      console.log(`Google Sheets portfolio data extracted: ${portfolioAssets.length} assets`);

      return NextResponse.json({
        success: true,
        assets: portfolioAssets
      });

    } catch (apiError) {
      console.error('Google Sheets API error:', apiError);
      return NextResponse.json({
        success: false,
        error: 'Unable to connect to Google Sheets. Please check the sheet is public and try again.',
        errorCode: 'EXTERNAL_SERVICE_ERROR'
      }, { status: 502 });
    }

  } catch (error: unknown) {
    console.error('Error fetching portfolio data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during portfolio data fetch',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
