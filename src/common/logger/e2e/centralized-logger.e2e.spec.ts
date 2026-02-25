import { Inject, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from '../logger.module';
import { CentralizedLoggerService } from '../services/centralized-logger.service';

// Test service that uses the logger
@Injectable()
class TestLoggerService {
  constructor(
    @Inject(CentralizedLoggerService)
    private readonly logger: CentralizedLoggerService,
  ) {
    this.logger.setContext(TestLoggerService.name);
  }

  async performOperation(userId: string, operation: string): Promise<void> {
    this.logger.info('Starting operation', { userId, operation });

    try {
      // Simulate some work
      this.logger.debug('Processing operation details', { userId, step: 1 });

      if (operation === 'fail') {
        throw new Error('Simulated operation failure');
      }

      this.logger.logBusinessEvent('operation_completed', {
        userId,
        operation,
        success: true,
      });

      this.logger.info('Operation completed successfully', {
        userId,
        operation,
      });
    } catch (error) {
      this.logger.error('Operation failed', error as Error, {
        userId,
        operation,
        step: 'error_handling',
      });
      throw error;
    }
  }

  async performDatabaseOperation(table: string, action: string): Promise<void> {
    this.logger.logDatabaseOperation(action, table, {
      timestamp: new Date().toISOString(),
    });
  }

  validateInput(field: string, value: any, rule: string): boolean {
    if (!value || value === 'invalid') {
      this.logger.logValidationError(field, value, rule, {
        validationStep: 'input_check',
      });
      return false;
    }
    return true;
  }
}

describe('CentralizedLoggerService E2E', () => {
  let testService: TestLoggerService;
  let loggerService: CentralizedLoggerService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [TestLoggerService],
    }).compile();

    testService = module.get<TestLoggerService>(TestLoggerService);
    loggerService = module.get<CentralizedLoggerService>(
      CentralizedLoggerService,
    );
  });

  afterEach(async () => {
    await module.close();
    jest.restoreAllMocks();
  });

  describe('Service Integration', () => {
    it('should inject and use logger in service', () => {
      expect(testService).toBeDefined();
      expect(loggerService).toBeDefined();
    });

    it('should log throughout service operation lifecycle', async () => {
      const infoSpy = jest.spyOn(loggerService, 'info').mockImplementation();
      const debugSpy = jest.spyOn(loggerService, 'debug').mockImplementation();
      const businessEventSpy = jest
        .spyOn(loggerService, 'logBusinessEvent')
        .mockImplementation();

      await testService.performOperation('user123', 'create_account');

      // Verify logging sequence
      expect(infoSpy).toHaveBeenCalledWith(
        'Starting operation',
        expect.objectContaining({
          userId: 'user123',
          operation: 'create_account',
        }),
      );

      expect(debugSpy).toHaveBeenCalledWith(
        'Processing operation details',
        expect.objectContaining({ userId: 'user123', step: 1 }),
      );

      expect(businessEventSpy).toHaveBeenCalledWith(
        'operation_completed',
        expect.objectContaining({
          userId: 'user123',
          operation: 'create_account',
          success: true,
        }),
      );

      expect(infoSpy).toHaveBeenCalledWith(
        'Operation completed successfully',
        expect.objectContaining({
          userId: 'user123',
          operation: 'create_account',
        }),
      );
    });

    it('should handle and log errors properly', async () => {
      const errorSpy = jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(
        testService.performOperation('user456', 'fail'),
      ).rejects.toThrow('Simulated operation failure');

      expect(errorSpy).toHaveBeenCalledWith(
        'Operation failed',
        expect.any(Error),
        expect.objectContaining({
          userId: 'user456',
          operation: 'fail',
          step: 'error_handling',
        }),
      );
    });

    it('should log database operations', async () => {
      const dbSpy = jest
        .spyOn(loggerService, 'logDatabaseOperation')
        .mockImplementation();

      await testService.performDatabaseOperation('users', 'INSERT');

      expect(dbSpy).toHaveBeenCalledWith(
        'INSERT',
        'users',
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });

    it('should log validation errors', () => {
      const validationSpy = jest
        .spyOn(loggerService, 'logValidationError')
        .mockImplementation();

      const result = testService.validateInput(
        'email',
        'invalid',
        'must be valid email',
      );

      expect(result).toBe(false);
      expect(validationSpy).toHaveBeenCalledWith(
        'email',
        'invalid',
        'must be valid email',
        expect.objectContaining({
          validationStep: 'input_check',
        }),
      );
    });
  });

  describe('Context Management', () => {
    it('should maintain different contexts for different services', () => {
      // Create another logger instance with different context
      const anotherLogger = new CentralizedLoggerService();

      expect(loggerService.getContext()).toBe('Application');
      expect(anotherLogger.getContext()).toBe('AnotherService');
    });

    it('should create child loggers with independent contexts', () => {
      const childLogger1 = loggerService.createChildLogger('Child1');
      const childLogger2 = loggerService.createChildLogger('Child2');

      expect(childLogger1.getContext()).toBe('Child1');
      expect(childLogger2.getContext()).toBe('Child2');
      expect(loggerService.getContext()).toBe('Application');

      // Modify one child's context
      childLogger1.setContext('ModifiedChild1');

      expect(childLogger1.getContext()).toBe('ModifiedChild1');
      expect(childLogger2.getContext()).toBe('Child2');
      expect(loggerService.getContext()).toBe('Application');
    });
  });

  describe('HTTP Request/Response Logging', () => {
    it('should format HTTP request and response logs correctly', () => {
      const httpRequestSpy = jest
        .spyOn(loggerService, 'logHttpRequest')
        .mockImplementation();
      const httpResponseSpy = jest
        .spyOn(loggerService, 'logHttpResponse')
        .mockImplementation();

      // Simulate HTTP request logging
      loggerService.logHttpRequest('POST', '/api/users', {
        userId: 'user789',
        requestId: 'req-123',
        ip: '192.168.1.100',
      });

      // Simulate HTTP response logging
      loggerService.logHttpResponse('POST', '/api/users', 201, 180, {
        userId: 'user789',
        requestId: 'req-123',
      });

      expect(httpRequestSpy).toHaveBeenCalledWith(
        'POST',
        '/api/users',
        expect.objectContaining({
          userId: 'user789',
          requestId: 'req-123',
          ip: '192.168.1.100',
        }),
      );

      expect(httpResponseSpy).toHaveBeenCalledWith(
        'POST',
        '/api/users',
        201,
        180,
        expect.objectContaining({
          userId: 'user789',
          requestId: 'req-123',
        }),
      );
    });
  });
});
