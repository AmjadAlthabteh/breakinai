/**
 * Enhanced Logger Utility
 * Provides structured logging with timestamps and colors
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

class Logger {
  private colors = {
    DEBUG: '\x1b[36m',    // Cyan
    INFO: '\x1b[34m',     // Blue
    WARN: '\x1b[33m',     // Yellow
    ERROR: '\x1b[31m',    // Red
    SUCCESS: '\x1b[32m',  // Green
    RESET: '\x1b[0m'
  };

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = this.getTimestamp();
    const color = this.colors[level];
    const reset = this.colors.RESET;

    let logMessage = `${color}[${timestamp}] [${level}]${reset} ${message}`;

    if (data) {
      logMessage += '\n' + JSON.stringify(data, null, 2);
    }

    return logMessage;
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, data));
  }

  error(message: string, error?: any): void {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error;

    console.error(this.formatMessage(LogLevel.ERROR, message, errorData));
  }

  success(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.SUCCESS, message, data));
  }

  // API Request Logger
  logRequest(method: string, path: string, ip: string): void {
    this.info(`${method} ${path}`, { ip, timestamp: this.getTimestamp() });
  }

  // Performance Logger
  logPerformance(operation: string, duration: number): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO;
    this.info(`Performance: ${operation}`, { duration: `${duration}ms`, level });
  }
}

export const logger = new Logger();
