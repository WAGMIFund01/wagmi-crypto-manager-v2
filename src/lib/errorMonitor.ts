import logger, { LogLevel } from './logger';

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  recentErrors: Array<{
    timestamp: string;
    error: string;
    endpoint?: string;
    userId?: string;
    context?: Record<string, any>;
  }>;
  lastErrorTime?: string;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  slowestEndpoints: Array<{
    endpoint: string;
    averageTime: number;
    requestCount: number;
  }>;
  totalRequests: number;
  errorRate: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  errorMetrics: ErrorMetrics;
  performanceMetrics: PerformanceMetrics;
  lastHealthCheck: string;
}

class ErrorMonitor {
  private errorMetrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {},
    errorsByEndpoint: {},
    recentErrors: [],
  };

  private performanceMetrics: PerformanceMetrics = {
    averageResponseTime: 0,
    slowestEndpoints: [],
    totalRequests: 0,
    errorRate: 0,
  };

  private requestTimes: Array<{ endpoint: string; duration: number }> = [];
  private startTime: number = Date.now();
  private maxRecentErrors: number = 100;

  // Error tracking
  recordError(
    error: Error,
    context?: {
      endpoint?: string;
      userId?: string;
      requestId?: string;
      additionalContext?: Record<string, any>;
    }
  ): void {
    this.errorMetrics.totalErrors++;
    
    // Track by error type
    const errorType = error.name || 'UnknownError';
    this.errorMetrics.errorsByType[errorType] = (this.errorMetrics.errorsByType[errorType] || 0) + 1;
    
    // Track by endpoint
    if (context?.endpoint) {
      this.errorMetrics.errorsByEndpoint[context.endpoint] = 
        (this.errorMetrics.errorsByEndpoint[context.endpoint] || 0) + 1;
    }

    // Add to recent errors
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: error.message,
      endpoint: context?.endpoint,
      userId: context?.userId,
      context: context?.additionalContext,
    };

    this.errorMetrics.recentErrors.push(errorEntry);
    
    // Keep only recent errors
    if (this.errorMetrics.recentErrors.length > this.maxRecentErrors) {
      this.errorMetrics.recentErrors.shift();
    }

    this.errorMetrics.lastErrorTime = new Date().toISOString();

    // Log the error
    logger.error(
      `Error recorded: ${error.message}`,
      error,
      context?.additionalContext,
      {
        endpoint: context?.endpoint,
        userId: context?.userId,
        requestId: context?.requestId,
      }
    );

    // Check for critical error patterns
    this.checkCriticalErrorPatterns(error, context);
  }

  // Performance tracking
  recordRequest(endpoint: string, duration: number, success: boolean = true): void {
    this.performanceMetrics.totalRequests++;
    
    // Track request time
    this.requestTimes.push({ endpoint, duration });
    
    // Keep only recent requests (last 1000)
    if (this.requestTimes.length > 1000) {
      this.requestTimes.shift();
    }

    // Update average response time
    const totalTime = this.requestTimes.reduce((sum, req) => sum + req.duration, 0);
    this.performanceMetrics.averageResponseTime = totalTime / this.requestTimes.length;

    // Update slowest endpoints
    this.updateSlowestEndpoints();

    // Update error rate
    this.updateErrorRate();

    // Log slow requests
    if (duration > 5000) { // 5 seconds
      logger.warn(`Slow request detected: ${endpoint}`, {
        duration,
        endpoint,
      });
    }

    // Log performance metrics periodically
    if (this.performanceMetrics.totalRequests % 100 === 0) {
      logger.info('Performance metrics update', {
        totalRequests: this.performanceMetrics.totalRequests,
        averageResponseTime: this.performanceMetrics.averageResponseTime,
        errorRate: this.performanceMetrics.errorRate,
      });
    }
  }

  private updateSlowestEndpoints(): void {
    const endpointTimes: Record<string, { total: number; count: number }> = {};
    
    this.requestTimes.forEach(req => {
      if (!endpointTimes[req.endpoint]) {
        endpointTimes[req.endpoint] = { total: 0, count: 0 };
      }
      endpointTimes[req.endpoint].total += req.duration;
      endpointTimes[req.endpoint].count += 1;
    });

    this.performanceMetrics.slowestEndpoints = Object.entries(endpointTimes)
      .map(([endpoint, data]) => ({
        endpoint,
        averageTime: data.total / data.count,
        requestCount: data.count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10); // Top 10 slowest endpoints
  }

  private updateErrorRate(): void {
    const recentRequests = this.requestTimes.slice(-100); // Last 100 requests
    const errorCount = this.errorMetrics.recentErrors.filter(
      error => new Date(error.timestamp) > new Date(Date.now() - 60000) // Last minute
    ).length;
    
    this.performanceMetrics.errorRate = recentRequests.length > 0 
      ? (errorCount / recentRequests.length) * 100 
      : 0;
  }

  private checkCriticalErrorPatterns(
    error: Error,
    context?: {
      endpoint?: string;
      userId?: string;
      requestId?: string;
      additionalContext?: Record<string, any>;
    }
  ): void {
    // Check for database connection errors
    if (error.message.includes('database') || error.message.includes('connection')) {
      logger.fatal('Database connection error detected', error, context?.additionalContext);
    }

    // Check for authentication errors
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      logger.error('Authentication error detected', error, context?.additionalContext);
    }

    // Check for rate limiting
    if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
      logger.warn('Rate limiting detected', error, context?.additionalContext);
    }

    // Check for external service errors
    if (error.message.includes('external') || error.message.includes('API')) {
      logger.error('External service error detected', error, context?.additionalContext);
    }
  }

  // Health check
  getSystemHealth(): SystemHealth {
    const uptime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage();
    
    // Determine health status
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (this.performanceMetrics.errorRate > 10) {
      status = 'critical';
    } else if (this.performanceMetrics.errorRate > 5 || this.performanceMetrics.averageResponseTime > 3000) {
      status = 'degraded';
    }

    return {
      status,
      uptime,
      memoryUsage,
      errorMetrics: { ...this.errorMetrics },
      performanceMetrics: { ...this.performanceMetrics },
      lastHealthCheck: new Date().toISOString(),
    };
  }

  // Get error metrics
  getErrorMetrics(): ErrorMetrics {
    return { ...this.errorMetrics };
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // Reset metrics (useful for testing)
  resetMetrics(): void {
    this.errorMetrics = {
      totalErrors: 0,
      errorsByType: {},
      errorsByEndpoint: {},
      recentErrors: [],
    };
    
    this.performanceMetrics = {
      averageResponseTime: 0,
      slowestEndpoints: [],
      totalRequests: 0,
      errorRate: 0,
    };
    
    this.requestTimes = [];
    this.startTime = Date.now();
  }

  // Get alerts based on current metrics
  getAlerts(): Array<{
    level: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
    context?: Record<string, any>;
  }> {
    const alerts: Array<{
      level: 'info' | 'warning' | 'critical';
      message: string;
      timestamp: string;
      context?: Record<string, any>;
    }> = [];

    // High error rate alert
    if (this.performanceMetrics.errorRate > 10) {
      alerts.push({
        level: 'critical',
        message: `High error rate detected: ${this.performanceMetrics.errorRate.toFixed(2)}%`,
        timestamp: new Date().toISOString(),
        context: { errorRate: this.performanceMetrics.errorRate },
      });
    }

    // Slow response time alert
    if (this.performanceMetrics.averageResponseTime > 3000) {
      alerts.push({
        level: 'warning',
        message: `Slow average response time: ${this.performanceMetrics.averageResponseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
        context: { averageResponseTime: this.performanceMetrics.averageResponseTime },
      });
    }

    // Memory usage alert
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      alerts.push({
        level: 'critical',
        message: `High memory usage: ${memoryUsagePercent.toFixed(2)}%`,
        timestamp: new Date().toISOString(),
        context: { memoryUsage, memoryUsagePercent },
      });
    }

    // Recent error spike alert
    const recentErrors = this.errorMetrics.recentErrors.filter(
      error => new Date(error.timestamp) > new Date(Date.now() - 300000) // Last 5 minutes
    );
    if (recentErrors.length > 10) {
      alerts.push({
        level: 'warning',
        message: `Error spike detected: ${recentErrors.length} errors in last 5 minutes`,
        timestamp: new Date().toISOString(),
        context: { recentErrorCount: recentErrors.length },
      });
    }

    return alerts;
  }
}

// Create singleton instance
const errorMonitor = new ErrorMonitor();

export default errorMonitor;

// Helper functions
export const recordError = (
  error: Error,
  context?: {
    endpoint?: string;
    userId?: string;
    requestId?: string;
    additionalContext?: Record<string, any>;
  }
) => {
  errorMonitor.recordError(error, context);
};

export const recordRequest = (endpoint: string, duration: number, success: boolean = true) => {
  errorMonitor.recordRequest(endpoint, duration, success);
};

export const getSystemHealth = () => errorMonitor.getSystemHealth();

export const getAlerts = () => errorMonitor.getAlerts();

