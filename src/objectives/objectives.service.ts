import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { Objective } from './entities/objective.entity';

@Injectable()
export class ObjectivesService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async createObjetive(createObjectiveDto: CreateObjectiveDto): Promise<Objective> {
    // Verify course exists
    const course = await this.courseRepository.findOne({
      where: { id: createObjectiveDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createObjectiveDto.courseId} not found`,
      );
    }
    if (createObjectiveDto.order === undefined) {
      const maxOrder = await this.objectiveRepository
        .createQueryBuilder('objective')
        .select('MAX(objective.order)', 'maxOrder')
        .where('objective.courseId = :courseId', {
          courseId: createObjectiveDto.courseId,
        })
        .getRawOne();

      createObjectiveDto.order = (maxOrder?.maxOrder || -1) + 1;
    }

    const objective = this.objectiveRepository.create(createObjectiveDto);
    return await this.objectiveRepository.save(objective);
  }

  async findAllObjectives(): Promise<Objective[]> {
    return await this.objectiveRepository.find({
      relations: ['course'],
      order: { courseId: 'ASC', order: 'ASC' },
    });
  }

  async findAllByCourse(courseId: string): Promise<Objective[]> {
    // Verify course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return await this.objectiveRepository.find({
      where: { courseId },
      relations: ['course'],
      order: { order: 'ASC' },
    });
  }

  async findOneObjective(id: string): Promise<Objective> {
    const objective = await this.objectiveRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!objective) {
      throw new NotFoundException(`Objective with ID ${id} not found`);
    }

    return objective;
  }

  async updateObjective(
    id: string,
    updateObjectiveDto: UpdateObjectiveDto,
  ): Promise<Objective> {
    const objective = await this.findOneObjective(id);

    // If courseId is being updated, verify the new course exists
    if (
      updateObjectiveDto.courseId &&
      updateObjectiveDto.courseId !== objective.courseId
    ) {
      const course = await this.courseRepository.findOne({
        where: { id: updateObjectiveDto.courseId },
      });

      if (!course) {
        throw new NotFoundException(
          `Course with ID ${updateObjectiveDto.courseId} not found`,
        );
      }
    }

    Object.assign(objective, updateObjectiveDto);
    return await this.objectiveRepository.save(objective);
  }

  async remove(id: string): Promise<void> {
    const objective = await this.findOneObjective(id);
    await this.objectiveRepository.remove(objective);
  }

  async reorder(
    courseId: string,
    objectiveIds: string[],
  ): Promise<Objective[]> {
    // Verify course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Verify all objectives belong to the course
    const objectives = await this.objectiveRepository.find({
      where: { courseId },
    });

    const existingIds = objectives.map((obj) => obj.id);
    const invalidIds = objectiveIds.filter((id) => !existingIds.includes(id));

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid objective IDs: ${invalidIds.join(', ')}`,
      );
    }

    // Update order for each objective
    const updatedObjectives: Objective[] = [];
    for (let i = 0; i < objectiveIds.length; i++) {
      const objective = objectives.find((obj) => obj.id === objectiveIds[i]);
      if (objective) {
        objective.order = i;
        const updated: Objective =
          await this.objectiveRepository.save(objective);
        updatedObjectives.push(updated);
      }
    }

    return updatedObjectives;
  }
}
