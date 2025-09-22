export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  userId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  duration?: number;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  serviceName: string;
  version: string;
  environment: string;
}

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      serviceName: 'wagmi-crypto-manager',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatLogEntry(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? ` | Error: ${entry.error.name}: ${entry.error.message}` : '';
    const metadataStr = [
      entry.userId && `User: ${entry.userId}`,
      entry.sessionId && `Session: ${entry.sessionId}`,
      entry.requestId && `Request: ${entry.requestId}`,
      entry.endpoint && `Endpoint: ${entry.endpoint}`,
      entry.duration && `Duration: ${entry.duration}ms`,
    ].filter(Boolean).join(' | ');

    return `[${entry.timestamp}] ${levelName}: ${entry.message}${contextStr}${errorStr}${metadataStr ? ` | ${metadataStr}` : ''}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    metadata?: {
      userId?: string;
      sessionId?: string;
      requestId?: string;
      endpoint?: string;
      duration?: number;
    }
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private async log(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console logging
    if (this.config.enableConsole) {
      const formatted = this.formatLogEntry(entry);
      
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formatted);
          break;
      }
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      try {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry),
        });
      } catch (error) {
        console.error('Failed to send log to remote endpoint:', error);
      }
    }
  }

  debug(message: string, context?: Record<string, any>, metadata?: any): void {
    this.log(this.createLogEntry(LogLevel.DEBUG, message, context, undefined, metadata));
  }

  info(message: string, context?: Record<string, any>, metadata?: any): void {
    this.log(this.createLogEntry(LogLevel.INFO, message, context, undefined, metadata));
  }

  warn(message: string, context?: Record<string, any>, metadata?: any): void {
    this.log(this.createLogEntry(LogLevel.WARN, message, context, undefined, metadata));
  }

  error(message: string, error?: Error, context?: Record<string, any>, metadata?: any): void {
    this.log(this.createLogEntry(LogLevel.ERROR, message, context, error, metadata));
  }

  fatal(message: string, error?: Error, context?: Record<string, any>, metadata?: any): void {
    this.log(this.createLogEntry(LogLevel.FATAL, message, context, error, metadata));
  }

  // Performance logging
  time(label: string): void {
    console.time(label);
  }

  timeEnd(label: string): void {
    console.timeEnd(label);
  }

  // API request logging
  logRequest(
    method: string,
    endpoint: string,
    requestId: string,
    userId?: string,
    duration?: number,
    statusCode?: number,
    error?: Error
  ): void {
    const level = error || (statusCode && statusCode >= 400) ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method} ${endpoint} ${statusCode ? `- ${statusCode}` : ''}`;
    const context = {
      method,
      endpoint,
      statusCode,
      duration,
    };

    this.log(this.createLogEntry(
      level,
      message,
      context,
      error,
      { requestId, userId, endpoint, duration }
    ));
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Update configuration
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
const logger = new Logger({
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.LOG_ENDPOINT,
});

export default logger;

// Helper functions for common logging patterns
export const logApiRequest = (
  method: string,
  endpoint: string,
  requestId: string,
  userId?: string,
  duration?: number,
  statusCode?: number,
  error?: Error
) => {
  logger.logRequest(method, endpoint, requestId, userId, duration, statusCode, error);
};

export const logError = (message: string, error?: Error, context?: Record<string, any>) => {
  logger.error(message, error, context);
};

export const logPerformance = (operation: string, duration: number, context?: Record<string, any>) => {
  logger.info(`Performance: ${operation}`, { ...context, duration });
};

export const logUserAction = (action: string, userId: string, context?: Record<string, any>) => {
  logger.info(`User Action: ${action}`, context, { userId });
};

export const logSystemEvent = (event: string, context?: Record<string, any>) => {
  logger.info(`System Event: ${event}`, context);
};

