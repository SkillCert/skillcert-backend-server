import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty({ 
    enum: ['ok', 'error', 'shutting_down'],
    description: 'Overall health status'
  })
  status: 'ok' | 'error' | 'shutting_down';

  @ApiProperty({ 
    description: 'Information about healthy services',
    required: false
  })
  info?: Record<string, HealthIndicatorStatus>;

  @ApiProperty({ 
    description: 'Information about unhealthy services',
    required: false
  })
  error?: Record<string, HealthIndicatorStatus>;

  @ApiProperty({ 
    description: 'Detailed information about all services'
  })
  details: Record<string, HealthIndicatorStatus>;
}

export class HealthIndicatorStatus {
  @ApiProperty({ 
    enum: ['up', 'down'],
    description: 'Service status'
  })
  status: 'up' | 'down';

  @ApiProperty({ 
    description: 'Status message',
    required: false
  })
  message?: string;

  [key: string]: any;
}

export class DatabaseHealthDto {
  @ApiProperty({ enum: ['up', 'down'] })
  status: 'up' | 'down';

  @ApiProperty({ required: false })
  message?: string;
}

export class MemoryHealthDto {
  @ApiProperty({ enum: ['up', 'down'] })
  status: 'up' | 'down';

  @ApiProperty({ required: false })
  heapUsed?: number;

  @ApiProperty({ required: false })
  heapTotal?: number;

  @ApiProperty({ required: false })
  rss?: number;
}

export class ServiceHealthDto {
  @ApiProperty({ enum: ['up', 'down'] })
  status: 'up' | 'down';

  @ApiProperty({ required: false })
  courses?: number;

  @ApiProperty({ required: false })
  categories?: number;

  @ApiProperty({ required: false })
  message?: string;
}