import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from './reviews.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { UsersRepository } from '../users/users.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/reviews.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepository: ReviewsRepository;
  let coursesRepository: CoursesRepository;
  let usersRepository: UsersRepository;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: 'user' as any,
    courses: [],
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockCourse: Course = {
    id: 'course-1',
    title: 'Test Course',
    description: 'Test Description',
    professorId: 'user-1',
    professor: mockUser,
    modules: [],
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    acquireReviewAverageRating: jest.fn().mockReturnValue(4.5),
  } as Course;

  const mockReview: Review = {
    userId: 'user-1',
    courseId: 'course-1',
    title: 'Great Course!',
    content: 'This course was very helpful.',
    rating: 5,
    user: mockUser,
    course: mockCourse,
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
  } as Review;

  const mockReviewsRepository = {
    findById: jest.fn(),
    create: jest.fn(),
    findByCourseId: jest.fn(),
    findByIdOrThrow: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCoursesRepository = {
    findByIdOrThrow: jest.fn(),
  };

  const mockUsersRepository = {
    findByIdOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: ReviewsRepository,
          useValue: mockReviewsRepository,
        },
        {
          provide: CoursesRepository,
          useValue: mockCoursesRepository,
        },
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewsRepository = module.get<ReviewsRepository>(ReviewsRepository);
    coursesRepository = module.get<CoursesRepository>(CoursesRepository);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    const createReviewDto: CreateReviewDto = {
      title: 'Great Course!',
      content: 'This course was very helpful.',
      rating: 5,
    };

    it('should create a new review successfully', async () => {
      mockReviewsRepository.findById.mockResolvedValue(null);
      mockCoursesRepository.findByIdOrThrow.mockResolvedValue(mockCourse);
      mockUsersRepository.findByIdOrThrow.mockResolvedValue(mockUser);
      mockReviewsRepository.create.mockResolvedValue(mockReview);

      const result = await service.createReview(
        'user-1',
        'course-1',
        createReviewDto,
      );

      expect(result).toEqual(mockReview);
      expect(mockReviewsRepository.findById).toHaveBeenCalledWith(
        'course-1',
        'user-1',
      );
      expect(mockCoursesRepository.findByIdOrThrow).toHaveBeenCalledWith(
        'course-1',
      );
      expect(mockUsersRepository.findByIdOrThrow).toHaveBeenCalledWith(
        'user-1',
      );
      expect(mockReviewsRepository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when review already exists', async () => {
      mockReviewsRepository.findById.mockResolvedValue(mockReview);

      await expect(
        service.createReview('user-1', 'course-1', createReviewDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createReview('user-1', 'course-1', createReviewDto),
      ).rejects.toThrow('Review already exists');
    });

    it('should throw BadRequestException when course not found', async () => {
      mockReviewsRepository.findById.mockResolvedValue(null);
      mockCoursesRepository.findByIdOrThrow.mockRejectedValue(
        new BadRequestException('Course not found'),
      );

      await expect(
        service.createReview('user-1', 'course-1', createReviewDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user not found', async () => {
      mockReviewsRepository.findById.mockResolvedValue(null);
      mockCoursesRepository.findByIdOrThrow.mockResolvedValue(mockCourse);
      mockUsersRepository.findByIdOrThrow.mockRejectedValue(
        new BadRequestException('User not found'),
      );

      await expect(
        service.createReview('user-1', 'course-1', createReviewDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findCourseReviews', () => {
    it('should return all reviews for a course', async () => {
      const mockReviews = [mockReview];
      mockReviewsRepository.findByCourseId.mockResolvedValue(mockReviews);

      const result = await service.findCourseReviews('course-1');

      expect(result).toEqual(mockReviews);
      expect(mockReviewsRepository.findByCourseId).toHaveBeenCalledWith(
        'course-1',
      );
    });

    it('should return empty array when no reviews exist for course', async () => {
      mockReviewsRepository.findByCourseId.mockResolvedValue([]);

      const result = await service.findCourseReviews('course-1');

      expect(result).toEqual([]);
      expect(mockReviewsRepository.findByCourseId).toHaveBeenCalledWith(
        'course-1',
      );
    });
  });

  describe('findCourseMyReview', () => {
    it('should return user review for a specific course', async () => {
      mockReviewsRepository.findByIdOrThrow.mockResolvedValue(mockReview);

      const result = await service.findCourseMyReview('user-1', 'course-1');

      expect(result).toEqual(mockReview);
      expect(mockReviewsRepository.findByIdOrThrow).toHaveBeenCalledWith(
        'course-1',
        'user-1',
      );
    });

    it('should throw error when review not found', async () => {
      mockReviewsRepository.findByIdOrThrow.mockRejectedValue(
        new BadRequestException('Review not found'),
      );

      await expect(
        service.findCourseMyReview('user-1', 'course-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateReview', () => {
    const updateReviewDto: UpdateReviewDto = {
      title: 'Updated Title',
      content: 'Updated content',
      rating: 4,
    };

    it('should update review successfully', async () => {
      const updatedReview = { ...mockReview, ...updateReviewDto };
      mockReviewsRepository.findByIdOrThrow.mockResolvedValue(mockReview);
      mockReviewsRepository.update.mockResolvedValue(updatedReview);

      const result = await service.updateReview(
        'user-1',
        'course-1',
        updateReviewDto,
      );

      expect(result).toEqual(mockReview);
      expect(mockReviewsRepository.findByIdOrThrow).toHaveBeenCalledWith(
        'course-1',
        'user-1',
      );
      expect(mockReviewsRepository.update).toHaveBeenCalledWith(
        'course-1',
        'user-1',
        mockReview,
      );
      expect(mockReview.update).toHaveBeenCalledWith(
        updateReviewDto.rating,
        updateReviewDto.title,
        updateReviewDto.content,
      );
    });

    it('should throw error when review not found for update', async () => {
      mockReviewsRepository.findByIdOrThrow.mockRejectedValue(
        new BadRequestException('Review not found'),
      );

      await expect(
        service.updateReview('user-1', 'course-1', updateReviewDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteReview', () => {
    it('should delete review successfully', async () => {
      mockReviewsRepository.delete.mockResolvedValue(undefined);

      await service.deleteReview('user-1', 'course-1');

      expect(mockReviewsRepository.delete).toHaveBeenCalledWith(
        'course-1',
        'user-1',
      );
    });

    it('should throw error when review not found for deletion', async () => {
      mockReviewsRepository.delete.mockRejectedValue(
        new BadRequestException('Review not found'),
      );

      await expect(service.deleteReview('user-1', 'course-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
