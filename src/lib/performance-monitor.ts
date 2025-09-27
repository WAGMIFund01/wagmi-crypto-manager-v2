import logger from './logger';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: string;
  context?: Record<string, any>;
  success: boolean;
  error?: string;
}

export interface PerformanceSummary {
  totalOperations: number;
  averageDuration: number;
  slowestOperation: PerformanceMetrics | null;
  errorRate: number;
  operations: PerformanceMetrics[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 operations

  /**
   * Track the performance of an operation
   */
  async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    const timestamp = new Date().toISOString();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      
      const metric: PerformanceMetrics = {
        operation,
        duration,
        timestamp,
        context,
        success: true
      };
      
      this.addMetric(metric);
      
      // Log slow operations (>1 second)
      if (duration > 1000) {
        logger.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`, {
          operation,
          duration,
          context
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      const metric: PerformanceMetrics = {
        operation,
        duration,
        timestamp,
        context,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.addMetric(metric);
      
      logger.error(`Operation failed: ${operation}`, error instanceof Error ? error : new Error('Unknown error'), {
        operation,
        duration,
        context
      });
      
      throw error;
    }
  }

  /**
   * Track a synchronous operation
   */
  trackSyncOperation<T>(
    operation: string,
    fn: () => T,
    context?: Record<string, any>
  ): T {
    const startTime = performance.now();
    const timestamp = new Date().toISOString();
    
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      
      const metric: PerformanceMetrics = {
        operation,
        duration,
        timestamp,
        context,
        success: true
      };
      
      this.addMetric(metric);
      
      // Log slow operations (>100ms for sync)
      if (duration > 100) {
        logger.warn(`Slow sync operation: ${operation} took ${duration.toFixed(2)}ms`, {
          operation,
          duration,
          context
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      const metric: PerformanceMetrics = {
        operation,
        duration,
        timestamp,
        context,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.addMetric(metric);
      
      logger.error(`Sync operation failed: ${operation}`, error instanceof Error ? error : new Error('Unknown error'), {
        operation,
        duration,
        context
      });
      
      throw error;
    }
  }

  /**
   * Add a metric to the collection
   */
  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics operations
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get performance summary for the last N operations
   */
  getSummary(lastN: number = 100): PerformanceSummary {
    const recentMetrics = this.metrics.slice(-lastN);
    
    if (recentMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        errorRate: 0,
        operations: []
      };
    }

    const totalDuration = recentMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageDuration = totalDuration / recentMetrics.length;
    const slowestOperation = recentMetrics.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
    const errorCount = recentMetrics.filter(m => !m.success).length;
    const errorRate = (errorCount / recentMetrics.length) * 100;

    return {
      totalOperations: recentMetrics.length,
      averageDuration,
      slowestOperation,
      errorRate,
      operations: recentMetrics
    };
  }

  /**
   * Get metrics for a specific operation
   */
  getOperationMetrics(operation: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  /**
   * Get slow operations (>threshold ms)
   */
  getSlowOperations(threshold: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get all metrics (for debugging)
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export utility functions for easy use
export const trackOperation = performanceMonitor.trackOperation.bind(performanceMonitor);
export const trackSyncOperation = performanceMonitor.trackSyncOperation.bind(performanceMonitor);
export const getPerformanceSummary = performanceMonitor.getSummary.bind(performanceMonitor);
export const getOperationMetrics = performanceMonitor.getOperationMetrics.bind(performanceMonitor);
export const getSlowOperations = performanceMonitor.getSlowOperations.bind(performanceMonitor);

