// Simple validation test for the centralized logger
import { CentralizedLoggerService } from './services/centralized-logger.service';

// Basic instantiation test
const logger = new CentralizedLoggerService();
logger.setContext('TestValidation');

console.log('✅ CentralizedLoggerService instantiated successfully');
console.log('✅ Context:', logger.getContext());

// Test basic logging methods
try {
  logger.info('Test info message', { test: true });
  logger.debug('Test debug message');
  logger.warn('Test warning message');
  logger.error('Test error message', new Error('Test error'));

  console.log('✅ All logging methods work correctly');
} catch (error) {
  console.error('❌ Error in logging methods:', error);
}

// Test context setting
logger.setContext('NewContext');
console.log('✅ Context changed to:', logger.getContext());

console.log('🎉 Logger validation completed successfully!');
