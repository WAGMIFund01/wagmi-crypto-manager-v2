import { NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { reportContextService } from '@/lib/reportContextService';

export async function GET() {
  try {
    // Test AI service configuration
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    
    // Test context service
    const context = await reportContextService.prepareReportContext();
    
    // Test AI service with a simple query
    const testResult = await aiService.generateReportDraft({
      context,
      conversationHistory: [
        { role: 'user', content: 'Generate a simple test report' }
      ]
    });

    return NextResponse.json({
      success: true,
      configuration: {
        hasOpenAIKey,
        contextDataAvailable: !!context.currentPortfolioData,
        previousReportsCount: context.previousReports.length
      },
      testResult: {
        success: testResult.success,
        hasDraft: !!testResult.draft,
        hasFollowUpQuestions: !!testResult.followUpQuestions
      }
    });

  } catch (error) {
    console.error('AI copilot test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
