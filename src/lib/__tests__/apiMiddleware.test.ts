import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createApiMiddleware, withApiMiddleware } from '../apiMiddleware';
import logger from '../logger';
import errorMonitor, { recordError, recordRequest } from '../errorMonitor';

// Mock dependencies
vi.mock('../logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  logApiRequest: vi.fn(),
}));

vi.mock('../errorMonitor', () => ({
  default: {
    recordError: vi.fn(),
    recordRequest: vi.fn(),
    getSystemHealth: vi.fn(),
    getAlerts: vi.fn(),
  },
  recordError: vi.fn(),
  recordRequest: vi.fn(),
}));

describe('API Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createApiMiddleware', () => {
    it('should wrap handler with logging and monitoring', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const middleware = createApiMiddleware();
      const wrappedHandler = middleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      const response = await wrappedHandler(request);

      expect(mockHandler).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
    });

    it('should log request start and completion', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const middleware = createApiMiddleware({ enableLogging: true });
      const wrappedHandler = middleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      await wrappedHandler(request);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('API Request Started: GET /api/test'),
        expect.objectContaining({
          method: 'GET',
          endpoint: '/api/test',
        }),
        expect.any(Object)
      );
    });

    it('should record request performance metrics', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const middleware = createApiMiddleware({ enablePerformanceTracking: true });
      const wrappedHandler = middleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      await wrappedHandler(request);

      expect(recordRequest).toHaveBeenCalledWith(
        '/api/test',
        expect.any(Number),
        true
      );
    });

    it('should handle errors and return error response', async () => {
      const mockError = new Error('Handler error');
      const mockHandler = vi.fn().mockRejectedValue(mockError);

      const middleware = createApiMiddleware({ enableErrorTracking: true });
      const wrappedHandler = middleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toBe('Internal server error');
      expect(responseBody.requestId).toBeDefined();
      expect(responseBody.timestamp).toBeDefined();

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('API Handler Error: GET /api/test'),
        mockError,
        expect.any(Object),
        expect.any(Object)
      );

      expect(recordError).toHaveBeenCalledWith(
        mockError,
        expect.objectContaining({
          endpoint: '/api/test',
        })
      );
    });

    it('should log slow requests', async () => {
      const mockHandler = vi.fn().mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve(NextResponse.json({ success: true })), 4000)
        )
      );

      const middleware = createApiMiddleware({ 
        slowRequestThreshold: 3000,
        enableLogging: true 
      });
      const wrappedHandler = middleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/slow', {
        method: 'GET',
      });

      await wrappedHandler(request);

      expect(logger.warn).toHaveBeenCalledWith(
        'Slow API request detected: GET /api/slow',
        expect.objectContaining({
          duration: expect.any(Number),
          threshold: 3000,
        })
      );
    });

    it('should capture and log request body when enabled', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const middleware = createApiMiddleware({ 
        logRequestBody: true,
        enableLogging: true 
      });
      const wrappedHandler = middleware(mockHandler);

      const requestBody = { test: 'data' };
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      await wrappedHandler(request);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('API Request Started: POST /api/test'),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle request body parsing errors gracefully', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const middleware = createApiMiddleware({ logRequestBody: true });
      const wrappedHandler = middleware(mockHandler);

      // Create request with invalid JSON body
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      // Should not throw error
      const response = await wrappedHandler(request);
      expect(response.status).toBe(200);
    });

    it('should respect configuration options', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const middleware = createApiMiddleware({
        enableLogging: false,
        enablePerformanceTracking: false,
        enableErrorTracking: false,
      });
      const wrappedHandler = middleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      await wrappedHandler(request);

      // Should not log when disabled
      expect(logger.info).not.toHaveBeenCalled();
      expect(recordRequest).not.toHaveBeenCalled();
    });
  });

  describe('withApiMiddleware', () => {
    it('should wrap API route handlers', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const wrappedHandler = withApiMiddleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      const response = await wrappedHandler(request);

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledWith(request);
    });

    it('should handle errors in wrapped handlers', async () => {
      const mockError = new Error('Handler error');
      const mockHandler = vi.fn().mockRejectedValue(mockError);

      const wrappedHandler = withApiMiddleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
    });
  });

  describe('Request ID Generation', () => {
    it('should generate unique request IDs', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const middleware = createApiMiddleware();
      const wrappedHandler = middleware(mockHandler);

      const request1 = new NextRequest('http://localhost:3000/api/test1', {
        method: 'GET',
      });
      const request2 = new NextRequest('http://localhost:3000/api/test2', {
        method: 'GET',
      });

      await wrappedHandler(request1);
      await wrappedHandler(request2);

      // Should generate different request IDs
      const logCalls = (logger.info as any).mock.calls;
      const requestId1 = logCalls[0][2]?.requestId;
      const requestId2 = logCalls[1][2]?.requestId;

      expect(requestId1).toBeDefined();
      expect(requestId2).toBeDefined();
      expect(requestId1).not.toBe(requestId2);
    });
  });

  describe('User ID Extraction', () => {
    it('should extract user ID from headers', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const middleware = createApiMiddleware({ enableLogging: true });
      const wrappedHandler = middleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'x-user-id': 'user-123',
        },
      });

      await wrappedHandler(request);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('API Request Started: GET /api/test'),
        expect.objectContaining({
          userId: 'user-123',
        }),
        expect.any(Object)
      );
    });

    it('should extract user ID from cookies', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const middleware = createApiMiddleware({ enableLogging: true });
      const wrappedHandler = middleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'cookie': 'userId=user-456',
        },
      });

      await wrappedHandler(request);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('API Request Started: GET /api/test'),
        expect.objectContaining({
          userId: 'user-456',
        }),
        expect.any(Object)
      );
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error response format', async () => {
      const mockError = new Error('Test error');
      const mockHandler = vi.fn().mockRejectedValue(mockError);

      const middleware = createApiMiddleware();
      const wrappedHandler = middleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      const response = await wrappedHandler(request);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        success: false,
        error: 'Internal server error',
        requestId: expect.any(String),
        timestamp: expect.any(String),
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should record failed requests correctly', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ error: 'Not found' }, { status: 404 })
      );

      const middleware = createApiMiddleware({ enablePerformanceTracking: true });
      const wrappedHandler = middleware(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      await wrappedHandler(request);

      expect(recordRequest).toHaveBeenCalledWith(
        '/api/test',
        expect.any(Number),
        false // Should be false for 404 status
      );
    });
  });
});

