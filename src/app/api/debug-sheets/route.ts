import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function GET() {
  try {
    console.log('=== SHEET DIAGNOSTICS ===');
    
    // Initialize the sheets adapter
    const { sheetsAdapter } = await import('@/lib/sheetsAdapter');
    
    // Get sheet metadata to see all sheets and their IDs
    const spreadsheet = await sheetsAdapter.getSheetMetadata();
    
    if (!spreadsheet?.data?.sheets) {
      return NextResponse.json({
        success: false,
        error: 'Could not retrieve sheet metadata'
      }, { status: 500 });
    }
    
    const sheetInfo = spreadsheet.data.sheets.map(sheet => ({
      title: sheet.properties?.title,
      sheetId: sheet.properties?.sheetId,
      index: sheet.properties?.index,
      sheetType: sheet.properties?.sheetType,
      gridProperties: {
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount
      }
    }));
    
    console.log('All sheets in document:', sheetInfo);
    
    // Check for potential naming issues
    const issues = [];
    
    // Check if "Portfolio Overview" exists
    const portfolioOverviewSheet = sheetInfo.find(s => s.title === 'Portfolio Overview');
    if (!portfolioOverviewSheet) {
      issues.push('Portfolio Overview sheet not found');
    }
    
    // Check if "Investors" exists
    const investorsSheet = sheetInfo.find(s => s.title === 'Investors');
    if (!investorsSheet) {
      issues.push('Investors sheet not found');
    }
    
    // Check if "Personal portfolio" exists
    const personalPortfolioSheet = sheetInfo.find(s => s.title === 'Personal portfolio');
    if (!personalPortfolioSheet) {
      issues.push('Personal portfolio sheet not found');
    }
    
    // Check if "KPIs" exists
    const kpisSheet = sheetInfo.find(s => s.title === 'KPIs');
    if (!kpisSheet) {
      issues.push('KPIs sheet not found');
    }
    
    // Check for similar sheet names that could cause confusion
    const similarNames = sheetInfo.filter(s => 
      s.title?.toLowerCase().includes('portfolio') || 
      s.title?.toLowerCase().includes('investor')
    );
    
    return NextResponse.json({
      success: true,
      sheetInfo,
      issues,
      similarNames,
      summary: {
        totalSheets: sheetInfo.length,
        hasIssues: issues.length > 0,
        potentialConflicts: similarNames.length
      }
    });
    
  } catch (error) {
    console.error('Error in sheet diagnostics:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
