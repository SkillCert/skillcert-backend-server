import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: jest.Mocked<CoursesService>;

  const mockCourse: Course = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Course',
    description: 'Test Description',
  } as Course;

  const mockCoursesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get(CoursesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return the created course', async () => {
      mockCoursesService.create.mockResolvedValue(mockCourse);

      const dto = { title: 'New Course', description: 'Desc' };
      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('findAll', () => {
    it('should return an array of courses', async () => {
      mockCoursesService.findAll.mockResolvedValue([mockCourse]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCourse]);
    });

    it('should return an empty array when no courses exist', async () => {
      mockCoursesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return a course by id', async () => {
      mockCoursesService.findOne.mockResolvedValue(mockCourse);

      const result = await controller.findOne(validId);

      expect(service.findOne).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException when course not found', async () => {
      mockCoursesService.findOne.mockRejectedValue(
        new NotFoundException('Course not found'),
      );

      await expect(controller.findOne(validId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(validId);
    });
  });

  describe('update', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return the updated course', async () => {
      const updateDto = { title: 'Updated Title' };
      mockCoursesService.update.mockResolvedValue({
        ...mockCourse,
        ...updateDto,
      });

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toEqual({ ...mockCourse, ...updateDto });
    });

    it('should throw BadRequestException if update DTO is undefined', async () => {
      mockCoursesService.update.mockRejectedValue(
        new BadRequestException('DTO is required'),
      );

      await expect(
        controller.update(validId, undefined as any),
      ).rejects.toThrow(BadRequestException);
      expect(service.update).toHaveBeenCalledWith(validId, undefined);
    });
  });

  describe('remove', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';

    it('should call remove on the service', async () => {
      mockCoursesService.remove.mockResolvedValue(undefined);

      await controller.remove(validId);

      expect(service.remove).toHaveBeenCalledWith(validId);
    });
  });
});
