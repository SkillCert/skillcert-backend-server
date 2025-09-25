import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ServiceHealthIndicator } from './indicators/service-health.indicator';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              info: {},
              error: {},
              details: {},
            }),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn(),
            checkRSS: jest.fn(),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: {
            checkStorage: jest.fn(),
          },
        },
        {
          provide: ServiceHealthIndicator,
          useValue: {
            checkCoreServices: jest.fn(),
            checkStorageService: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health check result', async () => {
    const result = await controller.check();
    expect(result).toBeDefined();
    expect(healthCheckService.check).toHaveBeenCalled();
  });

  it('should return database health check', async () => {
    const result = await controller.checkDatabase();
    expect(result).toBeDefined();
    expect(healthCheckService.check).toHaveBeenCalled();
  });

  it('should return memory health check', async () => {
    const result = await controller.checkMemory();
    expect(result).toBeDefined();
    expect(healthCheckService.check).toHaveBeenCalled();
  });
});