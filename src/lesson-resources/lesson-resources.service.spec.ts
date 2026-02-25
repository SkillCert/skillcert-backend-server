/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LESSON_RESOURCES_PATH } from 'src/lesson-resources/constants';
import { LOCAL_FILE_STORAGE_SERVICE } from 'src/storage/constants';
import { CentralizedLoggerService } from 'src/common/logger/services/centralized-logger.service';
import { Repository } from 'typeorm';
import {
  LessonResource,
  ResourceType,
} from '../entities/lesson-resource.entity';
import { FileStorageInterface } from '../storage/interfaces/file-storage.interface';
import { CreateLessonResourceDto } from './dto/create-lesson-resource.dto';
import { LessonResourcesService } from './lesson-resources.service';

describe('LessonResourcesService', () => {
  let service: LessonResourcesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Repository<LessonResource>>;

  const mockFileStorageService: jest.Mocked<FileStorageInterface> = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileUrl: jest.fn(),
    validateFile: jest.fn(),
  };

  const mockLessonResources = [
    {
      id: 'resource-uuid',
      title: 'Test Resource',
      description: 'Test Description',
      filename: 'unique-filename.pdf',
      original_name: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      file_path: '/uploads/lesson-resources/unique-filename.pdf',
      file_url:
        'http://localhost:3000/uploads/lesson-resources/unique-filename.pdf',
      resource_type: ResourceType.DOCUMENT,
      lesson_id: 'lesson-uuid',
    },
    {
      id: 'resource-uuid-2',
      title: 'Test Resource 2',
      description: 'Test Description 2',
      filename: 'unique-filename-2.pdf',
      original_name: 'test-2.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      file_path: '/uploads/lesson-resources/unique-filename-2.pdf',
      file_url:
        'http://localhost:3000/uploads/lesson-resources/unique-filename-2.pdf',
      resource_type: ResourceType.DOCUMENT,
      lesson_id: 'lesson-uuid',
    },
  ] as LessonResource[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonResourcesService,
        {
          provide: getRepositoryToken(LessonResource),
          useValue: mockRepository,
        },
        {
          provide: LOCAL_FILE_STORAGE_SERVICE,
          useValue: mockFileStorageService,
        },
        {
          provide: CentralizedLoggerService,
          useValue: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<LessonResourcesService>(LessonResourcesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Create Lesson Resource', () => {
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    const mockCreateLessonResourceDto = {
      title: 'Test Resource',
      description: 'Test Description',
      lesson_id: 'lesson-uuid',
    } satisfies CreateLessonResourceDto;

    const mockUploadResult = {
      filename: 'unique-filename.pdf',
      originalName: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      path: '/uploads/lesson-resources/unique-filename.pdf',
      url: 'http://localhost:3000/uploads/lesson-resources/unique-filename.pdf',
    };

    it('should create lesson resource successfully', async () => {
      const mockLessonResource = mockLessonResources[0];
      const lessonResourceFields = {
        title: 'Test Resource',
        description: 'Test Description',
        filename: 'unique-filename.pdf',
        original_name: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        file_path: '/uploads/lesson-resources/unique-filename.pdf',
        file_url:
          'http://localhost:3000/uploads/lesson-resources/unique-filename.pdf',
        resource_type: ResourceType.DOCUMENT,
        lesson_id: 'lesson-uuid',
      };
      const createSpyRepository = jest.spyOn(mockRepository, 'create');
      const saveSpyRepository = jest.spyOn(mockRepository, 'save');
      const uploadFileSpy = jest.spyOn(mockFileStorageService, 'uploadFile');

      mockFileStorageService.uploadFile.mockResolvedValue(mockUploadResult);
      mockRepository.create.mockReturnValue(mockLessonResource);
      mockRepository.save.mockResolvedValue(mockLessonResource);

      const result = await service.create(
        mockFile,
        mockCreateLessonResourceDto,
      );

      expect(uploadFileSpy).toHaveBeenCalledWith(
        mockFile,
        LESSON_RESOURCES_PATH,
      );
      expect(createSpyRepository).toHaveBeenCalledWith(
        expect.objectContaining(lessonResourceFields),
      );
      expect(saveSpyRepository).toHaveBeenCalledWith(
        expect.objectContaining(lessonResourceFields),
      );
      expect(result).toEqual(mockLessonResource);
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(
        service.create(undefined as any, mockCreateLessonResourceDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when file upload fails', async () => {
      mockFileStorageService.uploadFile.mockRejectedValue(
        new Error('Upload failed'),
      );

      await expect(
        service.create(mockFile, mockCreateLessonResourceDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all active lesson resources', async () => {
      const findSpyRepository = jest.spyOn(mockRepository, 'find');

      mockRepository.find.mockResolvedValue(mockLessonResources);

      const result = await service.findAll();

      expect(findSpyRepository).toHaveBeenCalledWith({
        relations: ['lesson'],
        where: { is_active: true },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockLessonResources);
    });
  });

  describe('findOne', () => {
    it('should return a lesson resource by id', async () => {
      const mockResource = mockLessonResources[0];
      const findOneSpyRepository = jest.spyOn(mockRepository, 'findOne');
      mockRepository.findOne.mockResolvedValue(mockResource);

      const result = await service.findOne('1');

      expect(findOneSpyRepository).toHaveBeenCalledWith({
        where: { id: '1', is_active: true },
        relations: ['lesson'],
      });
      expect(result).toEqual(mockResource);
    });

    it('should throw NotFoundException when resource not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByLesson', () => {
    it('should return resources for a specific lesson', async () => {
      const mockResources = [mockLessonResources[0]];
      const findSpyRepository = jest.spyOn(mockRepository, 'find');

      mockRepository.find.mockResolvedValue(mockResources);

      const result = await service.findByLesson('lesson-1');

      expect(findSpyRepository).toHaveBeenCalledWith({
        where: { lesson_id: 'lesson-1', is_active: true },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockResources);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a lesson resource', async () => {
      const updateSpyRepository = jest.spyOn(mockRepository, 'update');

      mockRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.softDelete('resource-uuid');

      expect(updateSpyRepository).toHaveBeenCalledWith('resource-uuid', {
        is_active: false,
      });
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete a lesson resource', async () => {
      const mockResource = mockLessonResources[1];
      const deleteFileSpy = jest.spyOn(mockFileStorageService, 'deleteFile');
      const deleteSpyRepository = jest.spyOn(mockRepository, 'delete');

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockResource as any);
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.permanentDelete('resource-uuid');

      expect(findOneSpy).toHaveBeenCalledWith('resource-uuid');
      expect(deleteFileSpy).toHaveBeenCalledWith(
        'unique-filename-2.pdf',
        LESSON_RESOURCES_PATH,
      );
      expect(deleteSpyRepository).toHaveBeenCalledWith('resource-uuid');
    });
  });

  describe('incrementDownloadCount', () => {
    it('should increment download count', async () => {
      const incrementSpyRepository = jest.spyOn(mockRepository, 'increment');
      mockRepository.increment.mockResolvedValue({ affected: 1 } as any);

      await service.incrementDownloadCount('resource-uuid');

      expect(incrementSpyRepository).toHaveBeenCalledWith(
        { id: 'resource-uuid' },
        'download_count',
        1,
      );
    });
  });
});
