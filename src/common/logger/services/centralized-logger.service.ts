import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import {
  ILoggerService,
  LogContext,
  LogEntry,
  LogLevel,
} from '../interfaces/logger.interface';

@Injectable()
export class CentralizedLoggerService implements ILoggerService {
  private logger: Logger;
  private context: string = 'Application';

  constructor(@Optional() @Inject('LOGGER_CONTEXT') context?: string) {
    this.context = context ?? 'Application';
    this.logger = new Logger(this.context);
  }

  /**
   * Set the context for this logger instance
   */
  setContext(context: string): void {
    this.context = context;
    this.logger = new Logger(context);
  }

  /**
   * Get the current context
   */
  getContext(): string {
    return this.context;
  }

  /**
   * Log debug messages
   */
  debug(message: string, context?: LogContext): void {
    const logEntry = this.createLogEntry(
      LogLevel.DEBUG,
      message,
      undefined,
      context,
    );
    this.logger.debug(this.formatMessage(logEntry));
  }

  /**
   * Log info messages
   */
  info(message: string, context?: LogContext): void {
    const logEntry = this.createLogEntry(
      LogLevel.INFO,
      message,
      undefined,
      context,
    );
    this.logger.log(this.formatMessage(logEntry));
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    const logEntry = this.createLogEntry(
      LogLevel.WARN,
      message,
      undefined,
      context,
    );
    this.logger.warn(this.formatMessage(logEntry));
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const logEntry = this.createLogEntry(
      LogLevel.ERROR,
      message,
      error,
      context,
    );
    const stack = error?.stack;

    this.logger.error(this.formatMessage(logEntry), stack);
  }

  /**
   * Create a structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    error?: Error,
    additionalContext?: LogContext,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      error,
      additionalContext,
    };
  }

  /**
   * Format the log message with additional context
   */
  private formatMessage(logEntry: LogEntry): string {
    let formattedMessage = logEntry.message;

    if (logEntry.additionalContext) {
      const contextParts: string[] = [];

      // Add request-related context
      if (logEntry.additionalContext.method && logEntry.additionalContext.url) {
        contextParts.push(
          `${logEntry.additionalContext.method} ${logEntry.additionalContext.url}`,
        );
      }

      // Add user context
      if (logEntry.additionalContext.userId) {
        contextParts.push(`User: ${logEntry.additionalContext.userId}`);
      }

      // Add request ID for tracing
      if (logEntry.additionalContext.requestId) {
        contextParts.push(`RequestID: ${logEntry.additionalContext.requestId}`);
      }

      // Add correlation ID for distributed tracing
      if (logEntry.additionalContext.correlationId) {
        contextParts.push(
          `CorrelationID: ${logEntry.additionalContext.correlationId}`,
        );
      }

      // Add status code if available
      if (logEntry.additionalContext.statusCode) {
        contextParts.push(`Status: ${logEntry.additionalContext.statusCode}`);
      }

      // Add response time if available
      if (logEntry.additionalContext.responseTime) {
        contextParts.push(`${logEntry.additionalContext.responseTime}ms`);
      }

      // Add IP address
      if (logEntry.additionalContext.ip) {
        contextParts.push(`IP: ${logEntry.additionalContext.ip}`);
      }

      if (contextParts.length > 0) {
        formattedMessage += ` [${contextParts.join(' | ')}]`;
      }

      // Add any additional custom context
      const customContext = { ...logEntry.additionalContext };
      delete customContext.method;
      delete customContext.url;
      delete customContext.userId;
      delete customContext.requestId;
      delete customContext.correlationId;
      delete customContext.statusCode;
      delete customContext.responseTime;
      delete customContext.ip;
      delete customContext.userAgent;

      if (Object.keys(customContext).length > 0) {
        formattedMessage += ` ${JSON.stringify(customContext)}`;
      }
    }

    return formattedMessage;
  }

  /**
   * Create a child logger with additional context
   */
  createChildLogger(context: string): CentralizedLoggerService {
    const childLogger = new CentralizedLoggerService();
    childLogger.setContext(context);
    return childLogger;
  }

  /**
   * Log HTTP request start
   */
  logHttpRequest(method: string, url: string, context?: LogContext): void {
    this.info(`${method} ${url} - Request started`, {
      method,
      url,
      ...context,
    });
  }

  /**
   * Log HTTP request completion
   */
  logHttpResponse(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext,
  ): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method} ${url} - Request completed`;

    if (level === LogLevel.ERROR) {
      this.error(message, undefined, {
        method,
        url,
        statusCode,
        responseTime,
        ...context,
      });
    } else {
      this.info(message, {
        method,
        url,
        statusCode,
        responseTime,
        ...context,
      });
    }
  }

  /**
   * Log database operations
   */
  logDatabaseOperation(
    operation: string,
    entity: string,
    context?: LogContext,
  ): void {
    this.debug(`Database ${operation} on ${entity}`, {
      operation,
      entity,
      ...context,
    });
  }

  /**
   * Log business logic events
   */
  logBusinessEvent(event: string, details?: any, context?: LogContext): void {
    this.info(`Business Event: ${event}`, {
      event,
      details,
      ...context,
    });
  }

  /**
   * Log validation errors
   */
  logValidationError(
    field: string,
    value: any,
    rule: string,
    context?: LogContext,
  ): void {
    this.warn(
      `Validation failed for field '${field}' with value '${value}' - Rule: ${rule}`,
      {
        field,
        value,
        rule,
        ...context,
      },
    );
  }
}
