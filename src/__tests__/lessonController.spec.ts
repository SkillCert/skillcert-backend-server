import { LessonsController } from '../lessons/lessons.controller';
import { LessonsService } from '../lessons/lessons.service';

describe('LessonsController', () => {
  let lessonsController: LessonsController;
  let lessonsService: LessonsService;

  beforeEach(() => {
    lessonsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByModuleId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    lessonsController = new LessonsController(lessonsService);
  });

  describe('findAll', () => {
    it('should return an array of lessons', async () => {
      const fakeLessons = [{ id: '1', title: 'Lesson 1' }];
      (lessonsService.findAll as jest.Mock).mockResolvedValue(fakeLessons);

      const result = await lessonsController.findAll(1, 10);
      expect(result).toEqual(fakeLessons);
      expect(lessonsService.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a lesson by ID', async () => {
      const fakeLesson = { id: '1', title: 'Lesson 1' };
      (lessonsService.findOne as jest.Mock).mockResolvedValue(fakeLesson);

      const result = await lessonsController.findOne('1');
      expect(result).toEqual(fakeLesson);
      expect(lessonsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findByModuleId', () => {
    it('should return lessons by moduleId', async () => {
      const fakeLessons = [{ id: '1', title: 'Lesson A', module_id: '10' }];
      (lessonsService.findByModuleId as jest.Mock).mockResolvedValue(
        fakeLessons,
      );

      const result = await lessonsController.findByModuleId('10', 1, 10);
      expect(result).toEqual(fakeLessons);
      expect(lessonsService.findByModuleId).toHaveBeenCalledWith('10', 1, 10);
    });
  });

  describe('create', () => {
    it('should create a new lesson', async () => {
      const dto = { title: 'New Lesson' };
      const newLesson = { id: '1', ...dto };
      (lessonsService.create as jest.Mock).mockResolvedValue(newLesson);

      const result = await lessonsController.create(dto as any);
      expect(result).toEqual(newLesson);
      expect(lessonsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const dto = { title: 'Updated Lesson' };
      const updatedLesson = { id: '1', ...dto };
      (lessonsService.update as jest.Mock).mockResolvedValue(updatedLesson);

      const result = await lessonsController.update('1', dto as any);
      expect(result).toEqual(updatedLesson);
      expect(lessonsService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should delete a lesson', async () => {
      (lessonsService.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await lessonsController.remove('1');
      expect(result).toBeUndefined();
      expect(lessonsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
