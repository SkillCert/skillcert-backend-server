import { CentralizedLoggerService } from '../services/centralized-logger.service';

describe('CentralizedLoggerService Performance', () => {
  let logger: CentralizedLoggerService;

  beforeEach(() => {
    logger = new CentralizedLoggerService();
  });

  describe('Performance Tests', () => {
    it('should handle high-volume logging efficiently', () => {
      const startTime = performance.now();
      const iterations = 1000;

      // Mock the underlying logger to avoid actual console output
      const mockLogger = {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };
      (logger as any).logger = mockLogger;

      // Perform high-volume logging
      for (let i = 0; i < iterations; i++) {
        logger.info(`Test message ${i}`, {
          userId: `user${i}`,
          operation: 'performance_test',
          iteration: i,
          timestamp: new Date().toISOString(),
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 1000 log operations in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
      expect(mockLogger.log).toHaveBeenCalledTimes(iterations);
    });

    it('should handle complex context objects without performance degradation', () => {
      const startTime = performance.now();

      // Mock the underlying logger
      const mockLogger = {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };
      (logger as any).logger = mockLogger;

      const complexContext = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            preferences: {
              theme: 'dark',
              language: 'en',
              notifications: {
                email: true,
                push: false,
                sms: true,
              },
            },
          },
        },
        request: {
          id: 'req-456',
          method: 'POST',
          url: '/api/complex-operation',
          headers: {
            'user-agent': 'Mozilla/5.0 (Test Browser)',
            accept: 'application/json',
            'content-type': 'application/json',
          },
          body: {
            data: Array(100)
              .fill(0)
              .map((_, i) => ({ id: i, value: `item-${i}` })),
          },
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: 'test',
          correlationId: 'corr-789',
        },
      };

      // Log with complex context 100 times
      for (let i = 0; i < 100; i++) {
        logger.info('Complex context test', {
          ...complexContext,
          iteration: i,
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle complex objects efficiently (< 50ms for 100 operations)
      expect(duration).toBeLessThan(50);
      expect(mockLogger.log).toHaveBeenCalledTimes(100);
    });

    it('should handle concurrent logging operations', async () => {
      const startTime = performance.now();

      // Mock the underlying logger
      const mockLogger = {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };
      (logger as any).logger = mockLogger;

      // Create multiple concurrent logging operations
      const promises = Array(50)
        .fill(0)
        .map(async (_, i) => {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              logger.info(`Concurrent message ${i}`, {
                threadId: i,
                operation: 'concurrent_test',
                timestamp: new Date().toISOString(),
              });
              resolve();
            }, Math.random() * 10); // Random delay up to 10ms
          });
        });

      await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle concurrent operations efficiently
      expect(duration).toBeLessThan(100);
      expect(mockLogger.log).toHaveBeenCalledTimes(50);
    });

    it('should have minimal memory footprint', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      const loggers = Array(100)
        .fill(0)
        .map(() => new CentralizedLoggerService());

      // Use each logger
      loggers.forEach((loggerInstance, i) => {
        // Mock the underlying logger for each instance
        const mockLogger = {
          log: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
          debug: jest.fn(),
        };
        (loggerInstance as any).logger = mockLogger;

        loggerInstance.info(`Test from logger ${i}`, { instance: i });
      });

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 1MB for 100 logger instances)
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle error logging efficiently', () => {
      const startTime = performance.now();

      // Mock the underlying logger
      const mockLogger = {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };
      (logger as any).logger = mockLogger;

      // Create test errors and log them
      for (let i = 0; i < 100; i++) {
        const testError = new Error(`Test error ${i}`);
        testError.stack = `Error: Test error ${i}\n    at test line ${i}`;

        logger.error('Performance test error', testError, {
          errorId: i,
          operation: 'error_performance_test',
          context: { additional: 'data' },
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Error logging should be efficient (< 50ms for 100 errors)
      expect(duration).toBeLessThan(50);
      expect(mockLogger.error).toHaveBeenCalledTimes(100);
    });
  });
});
