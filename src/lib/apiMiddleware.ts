import { NextRequest, NextResponse } from 'next/server';
import logger, { logApiRequest } from './logger';
import errorMonitor, { recordError, recordRequest } from './errorMonitor';
import { v4 as uuidv4 } from 'uuid';

export interface ApiMiddlewareConfig {
  enableLogging: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  logRequestBody: boolean;
  logResponseBody: boolean;
  maxRequestBodySize: number;
  maxResponseBodySize: number;
  slowRequestThreshold: number; // in milliseconds
}

const defaultConfig: ApiMiddlewareConfig = {
  enableLogging: true,
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  logRequestBody: process.env.NODE_ENV === 'development',
  logResponseBody: process.env.NODE_ENV === 'development',
  maxRequestBodySize: 1024 * 1024, // 1MB
  maxResponseBodySize: 1024 * 1024, // 1MB
  slowRequestThreshold: 3000, // 3 seconds
};

export function createApiMiddleware(config: Partial<ApiMiddlewareConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return function apiMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async function wrappedHandler(req: NextRequest): Promise<NextResponse> {
      const requestId = uuidv4();
      const startTime = Date.now();
      const method = req.method;
      const url = req.url;
      const endpoint = new URL(url).pathname;
      
      let requestBody: any = null;
      let responseBody: any = null;
      let userId: string | undefined;

      try {
        // Extract user ID from request if available
        userId = extractUserIdFromRequest(req);

        // Log request start
        if (finalConfig.enableLogging) {
          logger.info(`API Request Started: ${method} ${endpoint}`, {
            requestId,
            method,
            endpoint,
            userId,
            userAgent: req.headers.get('user-agent'),
            ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          }, {
            requestId,
            userId,
            endpoint,
          });
        }

        // Capture request body if enabled and within size limit
        if (finalConfig.logRequestBody && req.body) {
          try {
            const body = await req.clone().text();
            if (body.length <= finalConfig.maxRequestBodySize) {
              requestBody = JSON.parse(body);
            } else {
              logger.warn(`Request body too large to log: ${body.length} bytes`, {
                requestId,
                endpoint,
                bodySize: body.length,
                maxSize: finalConfig.maxRequestBodySize,
              });
            }
          } catch (error) {
            logger.debug('Failed to parse request body for logging', {
              requestId,
              endpoint,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        // Execute the actual handler
        const response = await handler(req);

        // Capture response body if enabled and within size limit
        if (finalConfig.logResponseBody && response.body) {
          try {
            const responseClone = response.clone();
            const responseText = await responseClone.text();
            if (responseText.length <= finalConfig.maxResponseBodySize) {
              responseBody = JSON.parse(responseText);
            } else {
              logger.warn(`Response body too large to log: ${responseText.length} bytes`, {
                requestId,
                endpoint,
                bodySize: responseText.length,
                maxSize: finalConfig.maxResponseBodySize,
              });
            }
          } catch (error) {
            logger.debug('Failed to parse response body for logging', {
              requestId,
              endpoint,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        const duration = Date.now() - startTime;
        const statusCode = response.status;

        // Record performance metrics
        if (finalConfig.enablePerformanceTracking) {
          recordRequest(endpoint, duration, statusCode < 400);
        }

        // Log request completion
        if (finalConfig.enableLogging) {
          logApiRequest(
            method,
            endpoint,
            requestId,
            userId,
            duration,
            statusCode
          );

          // Log slow requests
          if (duration > finalConfig.slowRequestThreshold) {
            logger.warn(`Slow API request detected: ${method} ${endpoint}`, {
              requestId,
              method,
              endpoint,
              duration,
              statusCode,
              userId,
              threshold: finalConfig.slowRequestThreshold,
            });
          }

          // Log request/response details in development
          if (process.env.NODE_ENV === 'development') {
            logger.debug(`API Request Details: ${method} ${endpoint}`, {
              requestId,
              requestBody,
              responseBody,
              statusCode,
              duration,
              userId,
            });
          }
        }

        // Log errors for non-success responses
        if (statusCode >= 400 && finalConfig.enableErrorTracking) {
          const error = new Error(`API Error: ${method} ${endpoint} - ${statusCode}`);
          recordError(error, {
            endpoint,
            userId,
            requestId,
            additionalContext: {
              method,
              statusCode,
              duration,
              requestBody,
              responseBody,
            },
          });
        }

        return response;

      } catch (error) {
        const duration = Date.now() - startTime;
        const statusCode = 500;

        // Record error metrics
        if (finalConfig.enableErrorTracking) {
          recordError(error as Error, {
            endpoint,
            userId,
            requestId,
            additionalContext: {
              method,
              duration,
              requestBody,
            },
          });
        }

        // Record performance metrics (failed request)
        if (finalConfig.enablePerformanceTracking) {
          recordRequest(endpoint, duration, false);
        }

        // Log the error
        logger.error(
          `API Handler Error: ${method} ${endpoint}`,
          error as Error,
          {
            requestId,
            method,
            endpoint,
            duration,
            userId,
            requestBody,
          },
          {
            requestId,
            userId,
            endpoint,
            duration,
          }
        );

        // Return error response
        return NextResponse.json(
          {
            success: false,
            error: 'Internal server error',
            requestId,
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    };
  };
}

// Helper function to extract user ID from request
function extractUserIdFromRequest(req: NextRequest): string | undefined {
  try {
    // Try to get from headers
    const userId = req.headers.get('x-user-id');
    if (userId) return userId;

    // Try to get from authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      // Parse JWT or other auth tokens if needed
      // This is a simplified example
      return undefined;
    }

    // Try to get from cookies
    const userIdCookie = req.cookies.get('userId');
    if (userIdCookie) return userIdCookie.value;

    return undefined;
  } catch (error) {
    logger.debug('Failed to extract user ID from request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return undefined;
  }
}

// Utility function to create a wrapped API route
export function withApiMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: Partial<ApiMiddlewareConfig>
) {
  const middleware = createApiMiddleware(config);
  return middleware(handler);
}

// Default middleware instance
export const apiMiddleware = createApiMiddleware();

// Export the middleware function for use in API routes
export default apiMiddleware;

