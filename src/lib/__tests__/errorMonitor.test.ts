import { describe, it, expect, beforeEach, vi } from 'vitest';
import errorMonitor, { recordError, recordRequest, getSystemHealth, getAlerts } from '../errorMonitor';
import logger from '../logger';

// Mock the logger
vi.mock('../logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    fatal: vi.fn(),
  },
}));

describe('ErrorMonitor', () => {
  beforeEach(() => {
    errorMonitor.resetMetrics();
  });

  describe('Error Recording', () => {
    it('should record errors and update metrics', () => {
      const error = new Error('Test error');
      const context = {
        endpoint: '/api/test',
        userId: 'user-123',
        requestId: 'req-456',
        additionalContext: { operation: 'test' },
      };

      recordError(error, context);

      const metrics = errorMonitor.getErrorMetrics();
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.errorsByType['Error']).toBe(1);
      expect(metrics.errorsByEndpoint['/api/test']).toBe(1);
      expect(metrics.recentErrors).toHaveLength(1);
      expect(metrics.recentErrors[0].error).toBe('Test error');
      expect(metrics.recentErrors[0].endpoint).toBe('/api/test');
      expect(metrics.recentErrors[0].userId).toBe('user-123');
    });

    it('should track different error types', () => {
      recordError(new Error('Database error'), { endpoint: '/api/db' });
      recordError(new TypeError('Type error'), { endpoint: '/api/type' });
      recordError(new Error('Database error'), { endpoint: '/api/db' });

      const metrics = errorMonitor.getErrorMetrics();
      expect(metrics.totalErrors).toBe(3);
      expect(metrics.errorsByType['Error']).toBe(2);
      expect(metrics.errorsByType['TypeError']).toBe(1);
      expect(metrics.errorsByEndpoint['/api/db']).toBe(2);
      expect(metrics.errorsByEndpoint['/api/type']).toBe(1);
    });

    it('should limit recent errors to maxRecentErrors', () => {
      // Record more errors than maxRecentErrors
      for (let i = 0; i < 150; i++) {
        recordError(new Error(`Error ${i}`), { endpoint: '/api/test' });
      }

      const metrics = errorMonitor.getErrorMetrics();
      expect(metrics.recentErrors.length).toBeLessThanOrEqual(100); // maxRecentErrors
    });
  });

  describe('Request Recording', () => {
    it('should record request performance', () => {
      recordRequest('/api/test', 150, true);
      recordRequest('/api/test', 200, true);
      recordRequest('/api/other', 100, true);

      const metrics = errorMonitor.getPerformanceMetrics();
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.averageResponseTime).toBe(150); // (150 + 200 + 100) / 3
    });

    it('should track slowest endpoints', () => {
      recordRequest('/api/slow', 5000, true);
      recordRequest('/api/fast', 100, true);
      recordRequest('/api/medium', 1000, true);
      recordRequest('/api/slow', 4000, true);

      const metrics = errorMonitor.getPerformanceMetrics();
      expect(metrics.slowestEndpoints).toHaveLength(3);
      expect(metrics.slowestEndpoints[0].endpoint).toBe('/api/slow');
      expect(metrics.slowestEndpoints[0].averageTime).toBe(4500); // (5000 + 4000) / 2
    });

    it('should limit request times storage', () => {
      // Record more requests than storage limit
      for (let i = 0; i < 1500; i++) {
        recordRequest('/api/test', 100, true);
      }

      const metrics = errorMonitor.getPerformanceMetrics();
      // Should not crash and should maintain reasonable performance
      expect(metrics.totalRequests).toBe(1500);
    });
  });

  describe('System Health', () => {
    it('should report healthy status for good metrics', async () => {
      // Record some successful requests
      for (let i = 0; i < 10; i++) {
        recordRequest('/api/test', 500, true);
      }

      // Add a small delay to ensure uptime > 0
      await new Promise(resolve => setTimeout(resolve, 10));

      const health = getSystemHealth();
      expect(health.status).toBe('healthy');
      expect(health.uptime).toBeGreaterThan(0);
      expect(health.performanceMetrics.totalRequests).toBe(10);
      expect(health.errorMetrics.totalErrors).toBe(0);
    });

    it('should report degraded status for high error rate', () => {
      // Record requests with some failures - need enough to get >5% error rate
      for (let i = 0; i < 100; i++) {
        recordRequest('/api/test', 500, i % 10 !== 0); // 90% success rate
        if (i % 10 === 0) {
          recordError(new Error('Request failed'), { endpoint: '/api/test' });
        }
      }

      const health = getSystemHealth();
      expect(health.status).toBe('degraded');
      expect(health.performanceMetrics.errorRate).toBeGreaterThan(5);
    });

    it('should report critical status for very high error rate', () => {
      // Record requests with high failure rate
      for (let i = 0; i < 20; i++) {
        recordRequest('/api/test', 500, i % 2 === 0); // 1/2 failure rate
        if (i % 2 === 0) {
          recordError(new Error('Request failed'), { endpoint: '/api/test' });
        }
      }

      const health = getSystemHealth();
      expect(health.status).toBe('critical');
      expect(health.performanceMetrics.errorRate).toBeGreaterThan(10);
    });

    it('should include memory usage in health check', () => {
      const health = getSystemHealth();
      expect(health.memoryUsage).toBeDefined();
      expect(health.memoryUsage.heapUsed).toBeDefined();
      expect(health.memoryUsage.heapTotal).toBeDefined();
      expect(health.memoryUsage.rss).toBeDefined();
    });
  });

  describe('Alerts', () => {
    it('should generate alerts for high error rate', () => {
      // Create high error rate
      for (let i = 0; i < 20; i++) {
        recordRequest('/api/test', 500, i % 2 === 0);
        if (i % 2 === 0) {
          recordError(new Error('Request failed'), { endpoint: '/api/test' });
        }
      }

      const alerts = getAlerts();
      const errorRateAlert = alerts.find(alert => alert.message.includes('High error rate'));
      expect(errorRateAlert).toBeDefined();
      expect(errorRateAlert?.level).toBe('critical');
    });

    it('should generate alerts for slow response times', () => {
      // Record slow requests
      for (let i = 0; i < 10; i++) {
        recordRequest('/api/slow', 4000, true);
      }

      const alerts = getAlerts();
      const slowResponseAlert = alerts.find(alert => alert.message.includes('Slow average response time'));
      expect(slowResponseAlert).toBeDefined();
      expect(slowResponseAlert?.level).toBe('warning');
    });

    it('should generate alerts for error spikes', () => {
      // Create recent error spike
      const recentTime = Date.now() - 60000; // 1 minute ago
      for (let i = 0; i < 15; i++) {
        recordError(new Error(`Error ${i}`), {
          endpoint: '/api/test',
          additionalContext: { timestamp: new Date(recentTime + i * 1000).toISOString() },
        });
      }

      const alerts = getAlerts();
      const errorSpikeAlert = alerts.find(alert => alert.message.includes('Error spike'));
      expect(errorSpikeAlert).toBeDefined();
      expect(errorSpikeAlert?.level).toBe('warning');
    });
  });

  describe('Critical Error Pattern Detection', () => {
    it('should detect database connection errors', () => {
      const dbError = new Error('Database connection failed');
      recordError(dbError, { endpoint: '/api/database' });

      // Should log as fatal error (mocked)
      // Use the imported logger
      expect(logger.error).toHaveBeenCalledWith(
        'Error recorded: Database connection failed',
        dbError,
        undefined,
        expect.objectContaining({
          endpoint: '/api/database',
        })
      );
    });

    it('should detect authentication errors', () => {
      const authError = new Error('Unauthorized access');
      recordError(authError, { endpoint: '/api/auth' });

      // Use the imported logger
      expect(logger.error).toHaveBeenCalledWith(
        'Error recorded: Unauthorized access',
        authError,
        undefined,
        expect.objectContaining({
          endpoint: '/api/auth',
        })
      );
    });

    it('should detect rate limiting errors', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      recordError(rateLimitError, { endpoint: '/api/rate-limited' });

      // Use the imported logger
      expect(logger.error).toHaveBeenCalledWith(
        'Error recorded: Rate limit exceeded',
        rateLimitError,
        undefined,
        expect.objectContaining({
          endpoint: '/api/rate-limited',
        })
      );
    });

    it('should detect external service errors', () => {
      const externalError = new Error('External API service unavailable');
      recordError(externalError, { endpoint: '/api/external' });

      // Use the imported logger
      expect(logger.error).toHaveBeenCalledWith(
        'Error recorded: External API service unavailable',
        externalError,
        undefined,
        expect.objectContaining({
          endpoint: '/api/external',
        })
      );
    });
  });

  describe('Performance Tracking', () => {
    it('should log slow requests', () => {
      recordRequest('/api/slow', 6000, true); // 6 seconds

      expect(logger.warn).toHaveBeenCalledWith(
        'Slow request detected: /api/slow',
        expect.objectContaining({
          duration: 6000,
          endpoint: '/api/slow',
        })
      );
    });

    it('should log performance metrics periodically', () => {
      // Record exactly 100 requests to trigger periodic logging
      for (let i = 0; i < 100; i++) {
        recordRequest('/api/test', 500, true);
      }

      expect(logger.info).toHaveBeenCalledWith(
        'Performance metrics update',
        expect.objectContaining({
          totalRequests: 100,
          averageResponseTime: 500,
        })
      );
    });
  });

  describe('Metrics Reset', () => {
    it('should reset all metrics', () => {
      // Record some data
      recordError(new Error('Test error'), { endpoint: '/api/test' });
      recordRequest('/api/test', 500, true);

      // Reset metrics
      errorMonitor.resetMetrics();

      const errorMetrics = errorMonitor.getErrorMetrics();
      const performanceMetrics = errorMonitor.getPerformanceMetrics();

      expect(errorMetrics.totalErrors).toBe(0);
      expect(errorMetrics.errorsByType).toEqual({});
      expect(errorMetrics.errorsByEndpoint).toEqual({});
      expect(errorMetrics.recentErrors).toEqual([]);
      expect(performanceMetrics.totalRequests).toBe(0);
      expect(performanceMetrics.averageResponseTime).toBe(0);
      expect(performanceMetrics.slowestEndpoints).toEqual([]);
    });
  });

  describe('Helper Functions', () => {
    it('should work with helper functions', () => {
      const error = new Error('Helper test error');
      recordError(error, { endpoint: '/api/helper' });
      recordRequest('/api/helper', 300, true);

      const health = getSystemHealth();
      expect(health.errorMetrics.totalErrors).toBe(1);
      expect(health.performanceMetrics.totalRequests).toBe(1);

      const alerts = getAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });
  });
});

