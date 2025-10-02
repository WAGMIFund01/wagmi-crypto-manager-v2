import { NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';

export async function GET() {
  try {
    const providers = aiService.getAvailableProviders();
    const currentProvider = aiService.getCurrentProvider();

    return NextResponse.json({
      success: true,
      providers,
      currentProvider
    });
  } catch (error) {
    console.error('Error fetching AI providers:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

