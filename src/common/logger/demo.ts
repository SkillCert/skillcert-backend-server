import { HttpException, HttpStatus } from '@nestjs/common';
import { CentralizedLoggerService } from './services/centralized-logger.service';

async function demonstrateLogger() {
  // Create logger instances
  const appLogger = new CentralizedLoggerService('DemoApp');
  const userLogger = new CentralizedLoggerService('UserService');
  const quizLogger = new CentralizedLoggerService('QuizService');

  console.log('🚀 Demonstrating Centralized Logger Service');
  console.log('='.repeat(50));

  // Basic logging
  appLogger.info('Application started successfully');
  appLogger.debug('Debug information for troubleshooting');
  appLogger.warn('This is a warning message');

  // Logging with context
  userLogger.info('User login attempt', {
    userId: 'user123',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    method: 'POST',
    url: '/auth/login',
  });

  // Error logging with stack trace
  try {
    throw new HttpException(
      'Simulated database connection error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  } catch (error) {
    userLogger.error('Database connection failed', error as Error, {
      operation: 'database_connect',
      host: 'localhost',
      port: 5432,
    });
  }

  // HTTP request logging
  userLogger.logHttpRequest('GET', '/api/users/profile', {
    userId: 'user123',
    requestId: 'req-456',
  });

  userLogger.logHttpResponse('GET', '/api/users/profile', 200, 150, {
    userId: 'user123',
    requestId: 'req-456',
  });

  // Business event logging
  quizLogger.logBusinessEvent('quiz_completed', {
    quizId: 'quiz789',
    userId: 'user123',
    score: 85,
    totalQuestions: 10,
  });

  // Validation error logging
  userLogger.logValidationError(
    'email',
    'invalid-email',
    'must be valid email format',
    {
      userId: 'user123',
      operation: 'user_registration',
    },
  );

  // Database operation logging
  userLogger.logDatabaseOperation('SELECT', 'users', {
    userId: 'user123',
    query: 'findUserById',
  });

  // Child logger demonstration
  const authLogger = appLogger.createChildLogger('AuthModule');
  authLogger.info('Authentication module initialized');

  console.log('='.repeat(50));
  console.log('✅ Logger demonstration completed');
}

// Export for use in tests or manual execution
export { demonstrateLogger };

// Uncomment to run demonstration
// demonstrateLogger().catch(console.error);
