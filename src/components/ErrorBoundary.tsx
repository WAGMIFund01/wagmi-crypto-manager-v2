'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    logger.error(
      'React Error Boundary caught an error',
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      {
        userId: this.getCurrentUserId(),
        sessionId: this.getCurrentSessionId(),
      }
    );

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      const investorData = sessionStorage.getItem('investorData');
      if (investorData) {
        const parsed = JSON.parse(investorData);
        return parsed.id || parsed.name;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return undefined;
  }

  private getCurrentSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('investorId') || undefined;
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReportError = () => {
    if (this.state.error && this.state.errorInfo) {
      // In a real application, you might send this to an error reporting service
      logger.error(
        'User reported error',
        this.state.error,
        {
          componentStack: this.state.errorInfo.componentStack,
          userReported: true,
        },
        {
          userId: this.getCurrentUserId(),
          sessionId: this.getCurrentSessionId(),
        }
      );
      
      // Show a confirmation message
      alert('Error has been reported. Thank you for your feedback!');
    }
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-white text-center mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-300 text-center mb-6">
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReportError}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Report Error
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Go to Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 p-4 bg-gray-700 rounded-lg">
                <summary className="text-white cursor-pointer font-medium">
                  Error Details (Development)
                </summary>
                <div className="mt-2 text-sm text-gray-300">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="mt-1 text-xs overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-xs overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: Record<string, any>) => {
    logger.error(
      'Error caught by useErrorHandler',
      error,
      context,
      {
        userId: getCurrentUserId(),
        sessionId: getCurrentSessionId(),
      }
    );
  };

  return { handleError };
};

// Helper functions
const getCurrentUserId = (): string | undefined => {
  try {
    const investorData = sessionStorage.getItem('investorData');
    if (investorData) {
      const parsed = JSON.parse(investorData);
      return parsed.id || parsed.name;
    }
  } catch (error) {
    // Ignore parsing errors
  }
  return undefined;
};

const getCurrentSessionId = (): string | undefined => {
  try {
    return sessionStorage.getItem('investorId') || undefined;
  } catch (error) {
    // Ignore errors
  }
  return undefined;
};

