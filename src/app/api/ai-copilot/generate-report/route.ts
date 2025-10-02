import { NextResponse } from 'next/server';
import { aiService, AIGenerateReportRequest } from '@/lib/aiService';

export async function POST(request: Request) {
  try {
    const body: AIGenerateReportRequest = await request.json();
    
    if (!body.context) {
      return NextResponse.json({
        success: false,
        error: 'Context is required'
      }, { status: 400 });
    }

    // Debug logging
    console.log('📋 Generate Report Request:');
    console.log('- Has portfolio data:', !!body.context.currentPortfolioData);
    if (body.context.currentPortfolioData) {
      const portfolioData = body.context.currentPortfolioData;
      console.log('- Portfolio assets count:', portfolioData.assets?.length || 0);
      if (portfolioData.assets && portfolioData.assets.length > 0) {
        const totalValue = portfolioData.assets.reduce((sum: number, asset: any) => sum + (asset.totalValue || 0), 0);
        console.log('- Calculated total value:', totalValue);
        console.log('- First asset:', portfolioData.assets[0]?.assetName, portfolioData.assets[0]?.totalValue);
      }
    }

    const result = await aiService.generateReportDraft(body);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('AI copilot generate report error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
