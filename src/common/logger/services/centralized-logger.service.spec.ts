import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CentralizedLoggerService } from './centralized-logger.service';

// Mock the Logger class
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe('CentralizedLoggerService', () => {
  let service: CentralizedLoggerService;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CentralizedLoggerService],
    }).compile();

    service = module.get<CentralizedLoggerService>(CentralizedLoggerService);
    // Get the mocked logger instance
    mockLogger = (service as any).logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor and context management', () => {
    it('should set default context when no context provided', () => {
      const defaultService = new CentralizedLoggerService();
      expect(defaultService.getContext()).toBe('Application');
    });

    it('should set custom context when provided', () => {
      const customService = new CentralizedLoggerService();
      expect(customService.getContext()).toBe('CustomService');
    });

    it('should update context with setContext', () => {
      service.setContext('NewContext');
      expect(service.getContext()).toBe('NewContext');
    });
  });

  describe('basic logging methods', () => {
    beforeEach(() => {
      service.setContext('TestService');
    });

    it('should log info messages', () => {
      const message = 'Test info message';
      const context = { userId: 'user123', operation: 'test' };

      service.info(message, context);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining(message),
      );
    });

    it('should log debug messages', () => {
      const message = 'Test debug message';
      const context = { debug: true };

      service.debug(message, context);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(message),
      );
    });

    it('should log warning messages', () => {
      const message = 'Test warning message';
      const context = { threshold: 90 };

      service.warn(message, context);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(message),
      );
    });

    it('should log error messages with error object', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      const context = { operation: 'test_operation' };

      service.error(message, error, context);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(message),
        error.stack,
      );
    });

    it('should log error messages without error object', () => {
      const message = 'Test error message without error object';
      const context = { operation: 'test_operation' };

      service.error(message, undefined, context);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(message),
        undefined,
      );
    });
  });

  describe('message formatting with context', () => {
    it('should format message with HTTP context', () => {
      const message = 'HTTP request';
      const context = {
        method: 'GET',
        url: '/api/users',
        statusCode: 200,
        responseTime: 150,
        userId: 'user123',
        requestId: 'req-456',
        ip: '192.168.1.100',
      };

      service.info(message, context);

      const calledMessage = mockLogger.log.mock.calls[0][0];
      expect(calledMessage).toContain('GET /api/users');
      expect(calledMessage).toContain('User: user123');
      expect(calledMessage).toContain('RequestID: req-456');
      expect(calledMessage).toContain('Status: 200');
      expect(calledMessage).toContain('150ms');
      expect(calledMessage).toContain('IP: 192.168.1.100');
    });

    it('should format message with correlation ID', () => {
      const message = 'Distributed trace';
      const context = {
        correlationId: 'trace-123',
        operation: 'user_service',
      };

      service.info(message, context);

      const calledMessage = mockLogger.log.mock.calls[0][0];
      expect(calledMessage).toContain('CorrelationID: trace-123');
    });

    it('should include custom context fields', () => {
      const message = 'Custom context test';
      const context = {
        customField1: 'value1',
        customField2: 42,
        customField3: true,
      };

      service.info(message, context);

      const calledMessage = mockLogger.log.mock.calls[0][0];
      expect(calledMessage).toContain('"customField1":"value1"');
      expect(calledMessage).toContain('"customField2":42');
      expect(calledMessage).toContain('"customField3":true');
    });
  });

  describe('specialized logging methods', () => {
    beforeEach(() => {
      jest.spyOn(service, 'info').mockImplementation();
      jest.spyOn(service, 'error').mockImplementation();
      jest.spyOn(service, 'debug').mockImplementation();
      jest.spyOn(service, 'warn').mockImplementation();
    });

    it('should log HTTP request start', () => {
      const method = 'POST';
      const url = '/api/users';
      const context = { userId: 'user123' };

      service.logHttpRequest(method, url, context);

      expect(service.info).toHaveBeenCalledWith(
        `${method} ${url} - Request started`,
        expect.objectContaining({
          method,
          url,
          ...context,
        }),
      );
    });

    it('should log successful HTTP response', () => {
      const method = 'GET';
      const url = '/api/users/123';
      const statusCode = 200;
      const responseTime = 120;
      const context = { userId: 'user123' };

      service.logHttpResponse(method, url, statusCode, responseTime, context);

      expect(service.info).toHaveBeenCalledWith(
        `${method} ${url} - Request completed`,
        expect.objectContaining({
          method,
          url,
          statusCode,
          responseTime,
          ...context,
        }),
      );
    });

    it('should log error HTTP response as error', () => {
      const method = 'POST';
      const url = '/api/users';
      const statusCode = 500;
      const responseTime = 300;
      const context = { userId: 'user123' };

      service.logHttpResponse(method, url, statusCode, responseTime, context);

      expect(service.error).toHaveBeenCalledWith(
        `${method} ${url} - Request completed`,
        undefined,
        expect.objectContaining({
          method,
          url,
          statusCode,
          responseTime,
          ...context,
        }),
      );
    });

    it('should log client error (4xx) as error', () => {
      const method = 'GET';
      const url = '/api/users/invalid';
      const statusCode = 404;
      const responseTime = 50;

      service.logHttpResponse(method, url, statusCode, responseTime);

      expect(service.error).toHaveBeenCalledWith(
        `${method} ${url} - Request completed`,
        undefined,
        expect.objectContaining({
          method,
          url,
          statusCode,
          responseTime,
        }),
      );
    });

    it('should log business events', () => {
      const event = 'user_registered';
      const details = { userId: 'user123', email: 'test@example.com' };
      const context = { source: 'registration_service' };

      service.logBusinessEvent(event, details, context);

      expect(service.info).toHaveBeenCalledWith(
        `Business Event: ${event}`,
        expect.objectContaining({
          event,
          details,
          ...context,
        }),
      );
    });

    it('should log database operations', () => {
      const operation = 'INSERT';
      const entity = 'users';
      const context = { userId: 'user123', recordCount: 1 };

      service.logDatabaseOperation(operation, entity, context);

      expect(service.debug).toHaveBeenCalledWith(
        `Database ${operation} on ${entity}`,
        expect.objectContaining({
          operation,
          entity,
          ...context,
        }),
      );
    });

    it('should log validation errors', () => {
      const field = 'email';
      const value = 'invalid-email';
      const rule = 'must be valid email format';
      const context = { userId: 'user123' };

      service.logValidationError(field, value, rule, context);

      expect(service.warn).toHaveBeenCalledWith(
        `Validation failed for field '${field}' with value '${value}' - Rule: ${rule}`,
        expect.objectContaining({
          field,
          value,
          rule,
          ...context,
        }),
      );
    });
  });

  describe('child logger creation', () => {
    it('should create child logger with different context', () => {
      const parentContext = 'ParentService';
      const childContext = 'ChildService';

      service.setContext(parentContext);
      const childLogger = service.createChildLogger(childContext);

      expect(service.getContext()).toBe(parentContext);
      expect(childLogger.getContext()).toBe(childContext);
      expect(childLogger).toBeInstanceOf(CentralizedLoggerService);
    });

    it('should create independent child logger instances', () => {
      const child1 = service.createChildLogger('Child1');
      const child2 = service.createChildLogger('Child2');

      child1.setContext('ModifiedChild1');

      expect(child1.getContext()).toBe('ModifiedChild1');
      expect(child2.getContext()).toBe('Child2');
      expect(service.getContext()).toBe('Application'); // Original unchanged
    });
  });
});
