import { Test, TestingModule } from '@nestjs/testing';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

describe('ModulesController', () => {
  let controller: ModulesController;
  let service: jest.Mocked<ModulesService>;

  const mockModulesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCourseId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulesController],
      providers: [
        {
          provide: ModulesService,
          useValue: mockModulesService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ModulesController>(ModulesController);
    service = module.get(ModulesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service with pagination query and return paginated results', async () => {
      const paginationQuery: PaginationQueryDto = { page: 2, limit: 10 };
      const mockPaginatedResult = {
        items: [],
        meta: { page: 2, limit: 10, total: 0, hasMore: false },
      };

      service.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(paginationQuery);

      expect(service.findAll).toHaveBeenCalledWith(paginationQuery);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findByCourseId', () => {
    it('should call service with courseId and pagination query', async () => {
      const courseId = 'some-course-id';
      const paginationQuery: PaginationQueryDto = { page: 1, limit: 5 };
      const mockPaginatedResult = {
        items: [],
        meta: { page: 1, limit: 5, total: 0, hasMore: false },
      };

      service.findByCourseId.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findByCourseId(courseId, paginationQuery);

      expect(service.findByCourseId).toHaveBeenCalledWith(
        courseId,
        paginationQuery,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
