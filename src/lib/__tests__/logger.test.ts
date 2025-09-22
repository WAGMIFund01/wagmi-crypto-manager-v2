import { describe, it, expect, beforeEach, vi } from 'vitest';
import logger, { LogLevel, logApiRequest, logError, logPerformance } from '../logger';

// Mock console methods
const mockConsole = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  time: vi.fn(),
  timeEnd: vi.fn(),
};

// Mock fetch
global.fetch = vi.fn();

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console mocks
    Object.assign(console, mockConsole);
    // Clear logs
    logger.clearLogs();
    // Enable console logging for tests
    (logger as any).config.enableConsole = true;
  });

  describe('Basic Logging', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      );
    });

    it('should log error messages with error objects', () => {
      const error = new Error('Test error');
      logger.error('Test error message', error);
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });

    it('should log warning messages', () => {
      logger.warn('Test warning message');
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Test warning message')
      );
    });

    it('should log debug messages', () => {
      logger.debug('Test debug message');
      
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('Test debug message')
      );
    });

    it('should log fatal messages', () => {
      const error = new Error('Fatal error');
      logger.fatal('Test fatal message', error);
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Test fatal message')
      );
    });
  });

  describe('Context Logging', () => {
    it('should include context in log messages', () => {
      const context = { userId: '123', action: 'login' };
      logger.info('User action', context);
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('User action')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Context: {"userId":"123","action":"login"}')
      );
    });

    it('should include metadata in log messages', () => {
      const metadata = { userId: '123', sessionId: 'abc' };
      logger.info('Test message', undefined, metadata);
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('User: 123')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Session: abc')
      );
    });
  });

  describe('Log Storage', () => {
    it('should store logs in memory', () => {
      logger.info('Test message 1');
      logger.error('Test message 2');
      logger.warn('Test message 3');
      
      const recentLogs = logger.getRecentLogs(10);
      expect(recentLogs).toHaveLength(3);
      expect(recentLogs[0].message).toBe('Test message 1');
      expect(recentLogs[1].message).toBe('Test message 2');
      expect(recentLogs[2].message).toBe('Test message 3');
    });

    it('should limit stored logs to maxLogs', () => {
      // Log more messages than maxLogs
      for (let i = 0; i < 1500; i++) {
        logger.info(`Test message ${i}`);
      }
      
      const recentLogs = logger.getRecentLogs();
      expect(recentLogs.length).toBeLessThanOrEqual(1000); // maxLogs
    });

    it('should get logs by level', () => {
      logger.info('Info message');
      logger.error('Error message');
      logger.warn('Warning message');
      logger.info('Another info message');
      
      const errorLogs = logger.getLogsByLevel(LogLevel.ERROR);
      const infoLogs = logger.getLogsByLevel(LogLevel.INFO);
      const warnLogs = logger.getLogsByLevel(LogLevel.WARN);
      
      expect(errorLogs).toHaveLength(1);
      expect(infoLogs).toHaveLength(2);
      expect(warnLogs).toHaveLength(1);
    });
  });

  describe('API Request Logging', () => {
    it('should log API requests with correct format', () => {
      logApiRequest('GET', '/api/test', 'req-123', 'user-456', 150, 200);
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/test - 200')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Request: req-123')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('User: user-456')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Duration: 150ms')
      );
    });

    it('should log API request errors', () => {
      const error = new Error('Request failed');
      logApiRequest('POST', '/api/test', 'req-123', 'user-456', 500, 500, error);
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('POST /api/test - 500')
      );
    });
  });

  describe('Helper Functions', () => {
    it('should log errors using helper function', () => {
      const error = new Error('Test error');
      logError('Helper error test', error, { context: 'test' });
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Helper error test')
      );
    });

    it('should log performance using helper function', () => {
      logPerformance('test-operation', 250, { count: 10 });
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Performance: test-operation')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('duration')
      );
    });
  });

  describe('Performance Timing', () => {
    it('should support timing operations', () => {
      logger.time('test-timer');
      logger.timeEnd('test-timer');
      
      expect(console.time).toHaveBeenCalledWith('test-timer');
      expect(console.timeEnd).toHaveBeenCalledWith('test-timer');
    });
  });

  describe('Remote Logging', () => {
    it('should send logs to remote endpoint when enabled', async () => {
      // Update config to enable remote logging
      logger.updateConfig({
        enableRemote: true,
        remoteEndpoint: 'https://logs.example.com',
      });

      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      logger.info('Test remote log');
      
      // Wait for async remote logging
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://logs.example.com',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('Test remote log'),
        })
      );
    });

    it('should handle remote logging errors gracefully', async () => {
      logger.updateConfig({
        enableRemote: true,
        remoteEndpoint: 'https://logs.example.com',
      });

      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      // Should not throw error
      expect(() => {
        logger.info('Test remote log');
      }).not.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should respect log level configuration', () => {
      logger.updateConfig({ level: LogLevel.ERROR });
      
      logger.debug('Debug message'); // Should not log
      logger.info('Info message');   // Should not log
      logger.warn('Warning message'); // Should not log
      logger.error('Error message');  // Should log
      
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error message')
      );
    });

    it('should disable console logging when configured', () => {
      logger.updateConfig({ enableConsole: false });
      
      logger.info('Test message');
      
      expect(console.info).not.toHaveBeenCalled();
    });
  });

  describe('Log Formatting', () => {
    it('should format log entries with all components', () => {
      // Spy on the logger's log method to see if it's being called
      const logSpy = vi.spyOn(logger as any, 'log');
      
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      
      logger.error('Test message', error, { context: 'test' }, {
        userId: '123',
        sessionId: 'abc',
        requestId: 'req-123',
        endpoint: '/api/test',
        duration: 150,
      });
      
      // Check if the internal log method was called
      expect(logSpy).toHaveBeenCalled();
      
      // Check if logger.error was called (it should be)
      expect(console.error).toHaveBeenCalled();
      
      // Get the mock calls safely
      const mockCalls = (console.error as any).mock?.calls;
      if (!mockCalls || mockCalls.length === 0) {
        // If no calls, the test should fail but let's be explicit
        throw new Error('console.error was not called by logger.error');
      }
      const logCall = mockCalls[0][0];
      
      expect(logCall).toContain('Test message');
      expect(logCall).toContain('Context: {"context":"test"}');
      expect(logCall).toContain('Error: Error: Test error');
      expect(logCall).toContain('User: 123');
      expect(logCall).toContain('Session: abc');
      expect(logCall).toContain('Request: req-123');
      expect(logCall).toContain('Endpoint: /api/test');
      expect(logCall).toContain('Duration: 150ms');
    });
  });
});

