import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function GET() {
  try {
    console.log('🔍 Fetching portfolio field options...');
    
    // Get portfolio data
    const portfolioData = await sheetsAdapter.getPortfolioData();
    
    if (!portfolioData || portfolioData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          chains: [],
          riskLevels: [],
          locations: [],
          coinTypes: []
        }
      });
    }

    // Extract unique values for each field
    const chains = [...new Set(portfolioData.map(asset => asset.chain).filter(Boolean))].sort();
    const riskLevels = [...new Set(portfolioData.map(asset => asset.riskLevel).filter(Boolean))].sort();
    const locations = [...new Set(portfolioData.map(asset => asset.location).filter(Boolean))].sort();
    const coinTypes = [...new Set(portfolioData.map(asset => asset.coinType).filter(Boolean))].sort();

    console.log('📊 Portfolio field options extracted:', {
      chains: chains.length,
      riskLevels: riskLevels.length,
      locations: locations.length,
      coinTypes: coinTypes.length
    });

    return NextResponse.json({
      success: true,
      data: {
        chains,
        riskLevels,
        locations,
        coinTypes
      }
    });

  } catch (error) {
    console.error('❌ Error fetching portfolio field options:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolio field options' 
      },
      { status: 500 }
    );
  }
}
