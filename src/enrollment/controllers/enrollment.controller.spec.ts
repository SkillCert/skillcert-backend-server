import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { Enrollment } from '../entities/enrollment.entity';
import { EnrollmentService } from '../providers/enrollment.service';
import { EnrollmentController } from './enrollment.controller';

describe('EnrollmentController', () => {
  let controller: EnrollmentController;
  let enrollmentService: jest.Mocked<EnrollmentService>;

  const mockEnrollmentService = {
    enroll: jest.fn(),
    getUserEnrollments: jest.fn(),
    removeEnrollment: jest.fn(),
  };

  const mockUser: User = {
    id: 'user-uuid-1',
    name: 'John Doe',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'user' as any,
    courses: [],
    reviews: [],
    enrollments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockCourse: Course = {
    id: 'course-uuid-1',
    title: 'Test Course',
    description: 'Test Course Description',
    professorId: 'professor-uuid-1',
    professor: mockUser,
    modules: [],
    reviews: [],
    enrollments: [],
    categoryId: 'category-uuid-1',
    category: null as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    acquireReviewAverageRating: jest.fn().mockReturnValue(4.5),
  } as Course;

  const mockEnrollment: Enrollment = {
    id: 'enrollment-uuid-1',
    user: mockUser,
    course: mockCourse,
    enrolledAt: new Date(),
    isActive: true,
    progress: [],
  } as Enrollment;

  const mockEnrollments: Enrollment[] = [
    {
      id: 'enrollment-uuid-1',
      user: mockUser,
      course: mockCourse,
      enrolledAt: new Date(),
      isActive: true,
      progress: [],
    },
    {
      id: 'enrollment-uuid-2',
      user: mockUser,
      course: {
        ...mockCourse,
        id: 'course-uuid-2',
        title: 'Advanced Course',
      } as Course,
      enrolledAt: new Date(),
      isActive: true,
      progress: [],
    },
  ] as Enrollment[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentController],
      providers: [
        {
          provide: EnrollmentService,
          useValue: mockEnrollmentService,
        },
      ],
    }).compile();

    controller = module.get<EnrollmentController>(EnrollmentController);
    enrollmentService = module.get(EnrollmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enroll', () => {
    const createEnrollmentDto: CreateEnrollmentDto = {
      userId: 'user-uuid-1',
      courseId: 'course-uuid-1',
    };

    it('should create enrollment successfully', async () => {
      // Arrange
      enrollmentService.enroll.mockResolvedValue(mockEnrollment);

      // Act
      const result = await controller.enroll(createEnrollmentDto);

      // Assert
      expect(enrollmentService.enroll).toHaveBeenCalledWith(
        createEnrollmentDto,
      );
      expect(enrollmentService.enroll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEnrollment);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const notFoundError = new NotFoundException('User not found');
      enrollmentService.enroll.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.enroll(createEnrollmentDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(enrollmentService.enroll).toHaveBeenCalledWith(
        createEnrollmentDto,
      );
      expect(enrollmentService.enroll).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when course not found', async () => {
      // Arrange
      const notFoundError = new NotFoundException('Course not found');
      enrollmentService.enroll.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.enroll(createEnrollmentDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(enrollmentService.enroll).toHaveBeenCalledWith(
        createEnrollmentDto,
      );
      expect(enrollmentService.enroll).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      enrollmentService.enroll.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.enroll(createEnrollmentDto)).rejects.toThrow(
        'Database connection failed',
      );
      expect(enrollmentService.enroll).toHaveBeenCalledWith(
        createEnrollmentDto,
      );
      expect(enrollmentService.enroll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserEnrollments', () => {
    const userId = 'user-uuid-1';

    it('should return user enrollments successfully', async () => {
      // Arrange
      enrollmentService.getUserEnrollments.mockResolvedValue(mockEnrollments);

      // Act
      const result = await controller.getUserEnrollments(userId);

      // Assert
      expect(enrollmentService.getUserEnrollments).toHaveBeenCalledWith(userId);
      expect(enrollmentService.getUserEnrollments).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEnrollments);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no enrollments', async () => {
      // Arrange
      enrollmentService.getUserEnrollments.mockResolvedValue([]);

      // Act
      const result = await controller.getUserEnrollments(userId);

      // Assert
      expect(enrollmentService.getUserEnrollments).toHaveBeenCalledWith(userId);
      expect(enrollmentService.getUserEnrollments).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database query failed');
      enrollmentService.getUserEnrollments.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.getUserEnrollments(userId)).rejects.toThrow(
        'Database query failed',
      );
      expect(enrollmentService.getUserEnrollments).toHaveBeenCalledWith(userId);
      expect(enrollmentService.getUserEnrollments).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid userId format', async () => {
      // Arrange
      const invalidUserId = 'invalid-uuid';
      enrollmentService.getUserEnrollments.mockResolvedValue([]);

      // Act
      const result = await controller.getUserEnrollments(invalidUserId);

      // Assert
      expect(enrollmentService.getUserEnrollments).toHaveBeenCalledWith(
        invalidUserId,
      );
      expect(enrollmentService.getUserEnrollments).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    const enrollmentId = 'enrollment-uuid-1';

    it('should remove enrollment successfully', async () => {
      // Arrange
      enrollmentService.removeEnrollment.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(enrollmentId);

      // Assert
      expect(enrollmentService.removeEnrollment).toHaveBeenCalledWith(
        enrollmentId,
      );
      expect(enrollmentService.removeEnrollment).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle service errors during removal', async () => {
      // Arrange
      const serviceError = new Error('Database deletion failed');
      enrollmentService.removeEnrollment.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.remove(enrollmentId)).rejects.toThrow(
        'Database deletion failed',
      );
      expect(enrollmentService.removeEnrollment).toHaveBeenCalledWith(
        enrollmentId,
      );
      expect(enrollmentService.removeEnrollment).toHaveBeenCalledTimes(1);
    });

    it('should handle non-existent enrollment ID', async () => {
      // Arrange
      const nonExistentId = 'non-existent-uuid';
      enrollmentService.removeEnrollment.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(nonExistentId);

      // Assert
      expect(enrollmentService.removeEnrollment).toHaveBeenCalledWith(
        nonExistentId,
      );
      expect(enrollmentService.removeEnrollment).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle invalid enrollment ID format', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      enrollmentService.removeEnrollment.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(invalidId);

      // Assert
      expect(enrollmentService.removeEnrollment).toHaveBeenCalledWith(
        invalidId,
      );
      expect(enrollmentService.removeEnrollment).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have enrollmentService injected', () => {
      expect(enrollmentService).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle null enrollment service response', async () => {
      // Arrange
      enrollmentService.getUserEnrollments.mockResolvedValue(null as any);

      // Act
      const result = await controller.getUserEnrollments('user-uuid-1');

      // Assert
      expect(result).toBeNull();
      expect(enrollmentService.getUserEnrollments).toHaveBeenCalledWith(
        'user-uuid-1',
      );
    });

    it('should handle undefined enrollment service response', async () => {
      // Arrange
      enrollmentService.enroll.mockResolvedValue(undefined as any);

      // Act
      const result = await controller.enroll({
        userId: 'user-uuid-1',
        courseId: 'course-uuid-1',
      });

      // Assert
      expect(result).toBeUndefined();
      expect(enrollmentService.enroll).toHaveBeenCalledWith({
        userId: 'user-uuid-1',
        courseId: 'course-uuid-1',
      });
    });
  });
});
