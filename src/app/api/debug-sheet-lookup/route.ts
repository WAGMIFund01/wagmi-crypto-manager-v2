import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function GET() {
  try {
    console.log('=== SHEET LOOKUP DIAGNOSTICS ===');
    
    // Initialize the sheets adapter
    const { sheetsAdapter } = await import('@/lib/sheetsAdapter');
    
    // Test the exact sheet lookup logic used in delete operations
    const sheetMetadata = await sheetsAdapter.getSheetMetadata();
    
    if (!sheetMetadata?.data?.sheets) {
      return NextResponse.json({
        success: false,
        error: 'Could not retrieve sheet metadata'
      }, { status: 500 });
    }
    
    // Test Portfolio Overview lookup (used in WAGMI Fund delete)
    const portfolioSheet = sheetMetadata.data.sheets.find(sheet => 
      sheet.properties?.title === 'Portfolio Overview'
    );
    
    console.log('Portfolio Overview lookup result:', portfolioSheet);
    
    // Test Personal portfolio lookup (used in Personal Portfolio delete)
    const personalPortfolioSheet = sheetMetadata.data.sheets.find(sheet => 
      sheet.properties?.title === 'Personal portfolio'
    );
    
    console.log('Personal portfolio lookup result:', personalPortfolioSheet);
    
    // Test Investors lookup (to see if it could be confused)
    const investorsSheet = sheetMetadata.data.sheets.find(sheet => 
      sheet.properties?.title === 'Investors'
    );
    
    console.log('Investors lookup result:', investorsSheet);
    
    // Check for potential issues
    const issues = [];
    
    if (!portfolioSheet) {
      issues.push('Portfolio Overview sheet not found');
    } else if (!portfolioSheet.properties?.sheetId) {
      issues.push('Portfolio Overview sheet missing sheetId');
    } else if (portfolioSheet.properties.sheetId === 0) {
      issues.push('Portfolio Overview sheet has sheetId 0 (same as Investors sheet)');
    }
    
    if (!personalPortfolioSheet) {
      issues.push('Personal portfolio sheet not found');
    } else if (!personalPortfolioSheet.properties?.sheetId) {
      issues.push('Personal portfolio sheet missing sheetId');
    }
    
    if (!investorsSheet) {
      issues.push('Investors sheet not found');
    } else if (!investorsSheet.properties?.sheetId) {
      issues.push('Investors sheet missing sheetId');
    } else if (investorsSheet.properties.sheetId === 0) {
      issues.push('Investors sheet has sheetId 0 - this could cause targeting issues');
    }
    
    // Check for sheet ID conflicts
    const sheetIds = sheetMetadata.data.sheets
      .map(sheet => sheet.properties?.sheetId)
      .filter(id => id !== undefined);
    
    const duplicateIds = sheetIds.filter((id, index) => sheetIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      issues.push(`Duplicate sheet IDs found: ${duplicateIds.join(', ')}`);
    }
    
    return NextResponse.json({
      success: true,
      portfolioSheet: portfolioSheet ? {
        title: portfolioSheet.properties?.title,
        sheetId: portfolioSheet.properties?.sheetId,
        index: portfolioSheet.properties?.index
      } : null,
      personalPortfolioSheet: personalPortfolioSheet ? {
        title: personalPortfolioSheet.properties?.title,
        sheetId: personalPortfolioSheet.properties?.sheetId,
        index: personalPortfolioSheet.properties?.index
      } : null,
      investorsSheet: investorsSheet ? {
        title: investorsSheet.properties?.title,
        sheetId: investorsSheet.properties?.sheetId,
        index: investorsSheet.properties?.index
      } : null,
      issues,
      allSheetIds: sheetIds,
      duplicateIds
    });
    
  } catch (error) {
    console.error('Error in sheet lookup diagnostics:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
