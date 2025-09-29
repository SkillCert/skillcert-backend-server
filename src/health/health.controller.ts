import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ServiceHealthIndicator } from './indicators/service-health.indicator';
import { HealthCheckDto } from './dto/health-check.dto';
import { HealthResponseTransformer } from './transformers/health-response.transformer';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private serviceHealth: ServiceHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'General health check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Health check result',
    type: HealthCheckDto
  })
  async check(): Promise<HealthCheckDto> {
    const result = await this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 0.8,
          path: '/',
        }),
    ]);
    
    return HealthResponseTransformer.transform(result);
  }

  @Get('database')
  @ApiOperation({ summary: 'Database connectivity check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Database health status',
    type: HealthCheckDto
  })
  async checkDatabase(): Promise<HealthCheckDto> {
    const result = await this.health.check([
      () => this.db.pingCheck('database'),
    ]);
    
    return HealthResponseTransformer.transform(result);
  }

  @Get('memory')
  @ApiOperation({ summary: 'Memory usage check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Memory health status',
    type: HealthCheckDto
  })
  async checkMemory(): Promise<HealthCheckDto> {
    const result = await this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
    
    return HealthResponseTransformer.transform(result);
  }

  @Get('services')
  @ApiOperation({ summary: 'Core services health check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Services health status',
    type: HealthCheckDto
  })
  async checkServices(): Promise<HealthCheckDto> {
    const result = await this.health.check([
      () => this.serviceHealth.checkCoreServices('core_services'),
      () => this.serviceHealth.checkStorageService('storage_service'),
    ]);
    
    return HealthResponseTransformer.transform(result);
  }

  @Get('full')
  @ApiOperation({ summary: 'Comprehensive health check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Complete health status',
    type: HealthCheckDto
  })
  async checkAll(): Promise<HealthCheckDto> {
    const result = await this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 0.8,
          path: '/',
        }),
      () => this.serviceHealth.checkCoreServices('core_services'),
      () => this.serviceHealth.checkStorageService('storage_service'),
    ]);
    
    return HealthResponseTransformer.transform(result);
  }
}