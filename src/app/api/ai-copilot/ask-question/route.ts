import { NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';

export async function POST(request: Request) {
  try {
    const { question, context, provider, hasExistingDraft } = await request.json();
    
    if (!question) {
      return NextResponse.json({
        success: false,
        error: 'Question is required'
      }, { status: 400 });
    }

    const result = await aiService.askFollowUpQuestion(question, context || {}, provider);
    
    // Detect if the question is feedback/suggestion that should update the report
    const isFeedbackPattern = /add|include|change|update|modify|remove|improve|enhance|focus|emphasize|mention|discuss/i;
    const suggestRegeneration = hasExistingDraft && isFeedbackPattern.test(question);
    
    return NextResponse.json({
      ...result,
      suggestRegeneration
    });

  } catch (error) {
    console.error('AI copilot ask question error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
