import { Global, Module } from '@nestjs/common';
import { CentralizedLoggerService } from './services/centralized-logger.service';

@Global()
@Module({
  providers: [CentralizedLoggerService],
  exports: [CentralizedLoggerService],
})
export class LoggerModule {}
