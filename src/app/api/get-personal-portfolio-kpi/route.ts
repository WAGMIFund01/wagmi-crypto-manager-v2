import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching Personal Portfolio KPI data...');

    // Get Personal Portfolio data to calculate AUM
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

    // Calculate AUM from Total Value column
    let totalAUM = 0;
    for (const asset of assets) {
      const totalValue = parseFloat(asset.totalValue) || 0;
      totalAUM += totalValue;
    }

    // Get current timestamp
    const now = new Date();
    const currentTimestamp = `${String(now.getUTCMonth() + 1).padStart(2, '0')}/${String(now.getUTCDate()).padStart(2, '0')}/${now.getUTCFullYear()}, ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;

    const kpiData = {
      totalAUM,
      lastUpdated: currentTimestamp,
      assetCount: assets.length
    };

    console.log(`Personal Portfolio KPI: AUM = $${totalAUM.toFixed(2)}, Assets = ${assets.length}`);

    return NextResponse.json({
      success: true,
      data: kpiData
    });

  } catch (error) {
    console.error('Error fetching Personal Portfolio KPI data:', error);
    return NextResponse.json({
      success: false,
      error: `Failed to fetch Personal Portfolio KPI data: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
