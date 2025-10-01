import { NextResponse } from 'next/server';
import { sheetsAdapter } from '@/lib/sheetsAdapter';

export async function GET() {
  try {
    console.log('=== ANALYZING INVESTOR DELETION PATTERNS ===');
    
    const analysis = {
      currentState: {},
      potentialCauses: [],
      recommendations: []
    };
    
    // Get current sheet structure
    const sheetMetadata = await sheetsAdapter.getSheetMetadata();
    const allSheets = sheetMetadata.data.sheets || [];
    
    // Analyze sheet IDs
    const sheetIds = allSheets.map(sheet => sheet.properties?.sheetId).filter(id => id !== undefined);
    const duplicateIds = sheetIds.filter((id, index) => sheetIds.indexOf(id) !== index);
    
    analysis.currentState = {
      totalSheets: allSheets.length,
      sheetIds: sheetIds,
      duplicateIds: duplicateIds,
      investorsSheetId: allSheets.find(s => s.properties?.title === 'Investors')?.properties?.sheetId,
      portfolioOverviewSheetId: allSheets.find(s => s.properties?.title === 'Portfolio Overview')?.properties?.sheetId,
      personalPortfolioSheetId: allSheets.find(s => s.properties?.title === 'Personal portfolio')?.properties?.sheetId
    };
    
    // Check for potential causes
    if (analysis.currentState.investorsSheetId === 0) {
      analysis.potentialCauses.push('Investors sheet has sheetId 0 - this is highly unusual and dangerous');
    }
    
    if (analysis.currentState.portfolioOverviewSheetId === 0) {
      analysis.potentialCauses.push('Portfolio Overview sheet has sheetId 0 - would target Investors sheet');
    }
    
    if (analysis.currentState.personalPortfolioSheetId === 0) {
      analysis.potentialCauses.push('Personal portfolio sheet has sheetId 0 - would target Investors sheet');
    }
    
    if (duplicateIds.length > 0) {
      analysis.potentialCauses.push(`Duplicate sheet IDs found: ${duplicateIds.join(', ')}`);
    }
    
    // Check for sheet name similarities that could cause confusion
    const similarNames = allSheets.filter(sheet => 
      sheet.properties?.title?.toLowerCase().includes('portfolio') || 
      sheet.properties?.title?.toLowerCase().includes('investor')
    );
    
    if (similarNames.length > 2) {
      analysis.potentialCauses.push(`Multiple sheets with similar names: ${similarNames.map(s => s.properties?.title).join(', ')}`);
    }
    
    // Generate recommendations
    if (analysis.currentState.investorsSheetId === 0) {
      analysis.recommendations.push('URGENT: The Investors sheet having sheetId 0 is the root cause of random deletions');
      analysis.recommendations.push('SOLUTION: The safety checks I added will prevent any delete operation from targeting sheetId 0');
    }
    
    if (analysis.potentialCauses.length === 0) {
      analysis.recommendations.push('No obvious structural issues found - the problem might be in the delete logic itself');
    }
    
    analysis.recommendations.push('Monitor the enhanced logging to see exactly which sheets are being targeted during delete operations');
    analysis.recommendations.push('The safety checks will now throw errors if any delete operation would target sheetId 0');
    
    return NextResponse.json({
      success: true,
      analysis,
      summary: {
        hasCriticalIssues: analysis.potentialCauses.some(cause => cause.includes('sheetId 0')),
        totalIssues: analysis.potentialCauses.length,
        recommendations: analysis.recommendations.length
      }
    });
    
  } catch (error) {
    console.error('Error in investor deletion analysis:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
