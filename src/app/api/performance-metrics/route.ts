import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance-monitor';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const lastN = parseInt(searchParams.get('lastN') || '100');
    const slowThreshold = parseInt(searchParams.get('slowThreshold') || '1000');
    
    logger.info('Fetching performance metrics', { requestId, operation, lastN, slowThreshold });
    
    let metrics;
    
    if (operation) {
      // Get metrics for specific operation
      metrics = {
        operation,
        metrics: performanceMonitor.getOperationMetrics(operation),
        summary: performanceMonitor.getSummary(lastN)
      };
    } else {
      // Get general summary
      metrics = {
        summary: performanceMonitor.getSummary(lastN),
        slowOperations: performanceMonitor.getSlowOperations(slowThreshold),
        allMetrics: performanceMonitor.getAllMetrics()
      };
    }
    
    logger.info('Performance metrics fetched successfully', { 
      requestId, 
      totalOperations: metrics.summary?.totalOperations || 0,
      averageDuration: metrics.summary?.averageDuration || 0
    });
    
    return NextResponse.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    logger.error('Error fetching performance metrics', error instanceof Error ? error : new Error('Unknown error'), { 
      requestId
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch performance metrics'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    logger.info('Clearing performance metrics', { requestId });
    
    performanceMonitor.clearMetrics();
    
    logger.info('Performance metrics cleared successfully', { requestId });
    
    return NextResponse.json({
      success: true,
      message: 'Performance metrics cleared'
    });
    
  } catch (error) {
    logger.error('Error clearing performance metrics', error instanceof Error ? error : new Error('Unknown error'), { 
      requestId
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to clear performance metrics'
    }, { status: 500 });
  }
}

