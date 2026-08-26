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

    /**
   * Creates a new objective for a given course.
   *
   * @param {CreateObjectiveDto} createObjectiveDto - Data transfer object containing objective details.
   *
   * @returns {Promise<Objective>} The created objective.
   */
  async createObjetive(
    createObjectiveDto: CreateObjectiveDto,
  ): Promise<Objective> {
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

    /**
   * Retrieves all objectives across all courses.
   *
   * @returns {Promise<Objective[]>} Array of all objectives.
   */
  async findAllObjectives(): Promise<Objective[]> {
    return await this.objectiveRepository.find({
      relations: ['course'],
      order: { courseId: 'ASC', order: 'ASC' },
    });
  }

    /**
   * Retrieves all objectives for a specific course.
   *
   * @param {string} courseId - ID of the course.
   *
   * @returns {Promise<Objective[]>} Array of objectives belonging to the course.
   */
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

    /**
   * Retrieves a single objective by its ID.
   *
   * @param {string} id - ID of the objective.
   *
   * @returns {Promise<Objective>} The found objective.
   */
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

    /**
   * Updates an existing objective.
   *
   * @param {string} id - ID of the objective to update.
   * @param {UpdateObjectiveDto} updateObjectiveDto - Data to update the objective with.
   *
   * @returns {Promise<Objective>} The updated objective.
   */
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

  // Alias methods matching controller expectations
    /**
   * Alias for createObjetive.
   *
   * @param {CreateObjectiveDto} dto - Data transfer object containing objective details.
   *
   * @returns {Promise<Objective>} The created objective.
   */
  async create(dto: CreateObjectiveDto): Promise<Objective> {
    return this.createObjetive(dto);
  }

    /**
   * Alias for findAllObjectives.
   *
   * @returns {Promise<Objective[]>} Array of all objectives.
   */
  async findAll(): Promise<Objective[]> {
    return this.findAllObjectives();
  }

    /**
   * Alias for findOneObjective.
   *
   * @param {string} id - ID of the objective.
   *
   * @returns {Promise<Objective>} The found objective.
   */
  async findOne(id: string): Promise<Objective> {
    return this.findOneObjective(id);
  }

    /**
   * Alias for updateObjective.
   *
   * @param {string} id - ID of the objective to update.
   * @param {UpdateObjectiveDto} dto - Data to update the objective with.
   *
   * @returns {Promise<Objective>} The updated objective.
   */
  async update(id: string, dto: UpdateObjectiveDto): Promise<Objective> {
    return this.updateObjective(id, dto);
  }

    /**
   * Deletes an objective by its ID.
   *
   * @param {string} id - ID of the objective to delete.
   *
   * @returns {Promise<void>} Resolves when the objective is deleted.
   */
  async remove(id: string): Promise<void> {
    const objective = await this.findOneObjective(id);
    await this.objectiveRepository.remove(objective);
  }

    /**
   * Reorders the objectives within a course.
   *
   * @param {string} courseId - ID of the course.
   * @param {string[]} objectiveIds - Array of objective IDs in the new order.
   *
   * @returns {Promise<Objective[]>} Array of updated objectives.
   */
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
