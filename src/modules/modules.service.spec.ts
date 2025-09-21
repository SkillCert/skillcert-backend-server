import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Module } from './entities/module.entity';
import { ModulesService } from './modules.service';

type MockRepository = Partial<Record<keyof Repository<Module>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('ModulesService', () => {
  let service: ModulesService;
  let moduleRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModulesService,
        {
          provide: getRepositoryToken(Module),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ModulesService>(ModulesService);
    moduleRepository = module.get<MockRepository>(getRepositoryToken(Module));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated modules and metadata', async () => {
      const paginationQuery: PaginationQueryDto = { page: 2, limit: 5 };
      const mockModules = [{ id: '1', title: 'Test Module' }] as Module[];
      const total = 12;
      const skip = (paginationQuery.page! - 1) * paginationQuery.limit!;
      const take = paginationQuery.limit!;

      moduleRepository.findAndCount!.mockResolvedValue([mockModules, total]);

      const result = await service.findAll(paginationQuery);

      expect(moduleRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['course', 'lessons'],
        skip,
        take,
        order: { created_at: 'DESC' },
      });

      expect(result.items.length).toBe(mockModules.length);
      expect(result.meta.total).toBe(total);
      expect(result.meta.page).toBe(paginationQuery.page);
      expect(result.meta.limit).toBe(paginationQuery.limit);
      expect(result.meta.hasMore).toBe(true);
    });
  });

  describe('findByCourseId', () => {
    it('should return paginated modules for a given courseId', async () => {
      const courseId = 'test-course-id';
      const paginationQuery: PaginationQueryDto = { page: 1, limit: 10 };
      const mockModules = [
        { id: '1', title: 'Module 1' },
        { id: '2', title: 'Module 2' },
      ] as Module[];
      const total = 2;
      const skip = (paginationQuery.page! - 1) * paginationQuery.limit!;
      const take = paginationQuery.limit!;

      moduleRepository.findAndCount!.mockResolvedValue([mockModules, total]);

      const result = await service.findByCourseId(courseId, paginationQuery);

      expect(moduleRepository.findAndCount).toHaveBeenCalledWith({
        where: { course_id: courseId },
        relations: ['lessons'],
        order: { created_at: 'ASC' },
        skip,
        take,
      });

      expect(result.items.length).toBe(mockModules.length);
      expect(result.meta.total).toBe(total);
      expect(result.meta.page).toBe(paginationQuery.page);
      expect(result.meta.limit).toBe(paginationQuery.limit);
      expect(result.meta.hasMore).toBe(false);
    });
  });
});
