import { BadRequestException, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import type { CreateCourseDto } from "./dto/create-course.dto"
import type { UpdateCourseDto } from "./dto/update-course.dto"
import { Course } from "./entities/course.entity"

@Injectable()
export class CoursesRepository {
    constructor(
        @InjectRepository(Course)
        private courseRepository: Repository<Course>,
    ) { }

    async create(createCourseDto: CreateCourseDto): Promise<Course> {
        const course = this.courseRepository.create(createCourseDto)
        return await this.courseRepository.save(course)
    }

    async findAll(): Promise<Course[]> {
        return await this.courseRepository.find({
            relations: ["professor", "category"],
            select: {
                id: true,
                title: true,
                description: true,
                professorId: true,
                categoryId: true,
                createdAt: true,
                updatedAt: true,
                professor: {
                    id: true,
                    name: true,
                    email: true,
                },
                category: {
                    id: true,
                    name: true,
                    color: true,
                },
            },
        })
    }

    async findByProfessorId(professorId: string): Promise<Course[]> {
        return await this.courseRepository.find({
            where: { professorId },
            relations: ["professor", "category"],
            select: {
                id: true,
                title: true,
                description: true,
                professorId: true,
                categoryId: true,
                createdAt: true,
                updatedAt: true,
                professor: {
                    id: true,
                    name: true,
                    email: true,
                },
                category: {
                    id: true,
                    name: true,
                    color: true,
                },
            },
        })
    }

    async findById(id: string): Promise<Course | null> {
        return await this.courseRepository.findOne({
            where: { id },
            relations: ["professor", "category"],
            select: {
                id: true,
                title: true,
                description: true,
                professorId: true,
                categoryId: true,
                createdAt: true,
                updatedAt: true,
                professor: {
                    id: true,
                    name: true,
                    email: true,
                },
                category: {
                    id: true,
                    name: true,
                    color: true,
                },
            },
        })
    }

    async findByIdOrThrow(id: string, onNotFound?: () => never): Promise<Course> {
        const course = await this.findById(id);
        if (course) {
            return course;
        }

        if (onNotFound) {
            return onNotFound();
        }

        throw new BadRequestException('cannot find course');
    }

    async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course | null> {
        await this.courseRepository.update(id, updateCourseDto)
        return await this.findById(id)
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.courseRepository.delete(id)
        return (result.affected ?? 0) > 0
    }

    async exists(id: string): Promise<boolean> {
        const count = await this.courseRepository.count({ where: { id } })
        return count > 0
    }

    async findByIdAndProfessor(id: string, professorId: string): Promise<Course | null> {
        return await this.courseRepository.findOne({
            where: { id, professorId },
            relations: ["professor", "category"],
            select: {
                id: true,
                title: true,
                description: true,
                professorId: true,
                categoryId: true,
                createdAt: true,
                updatedAt: true,
                professor: {
                    id: true,
                    name: true,
                    email: true,
                },
                category: {
                    id: true,
                    name: true,
                    color: true,
                },
            },
        })
    }

    async titleExists(title: string, excludeId?: string): Promise<boolean> {
        const query = this.courseRepository.createQueryBuilder("course").where("course.title = :title", { title })

        if (excludeId) {
            query.andWhere("course.id != :excludeId", { excludeId })
        }

        const count = await query.getCount()
        return count > 0
    }

    async findByCategoryId(categoryId: string): Promise<Course[]> {
        return await this.courseRepository.find({
            where: { categoryId },
            relations: ["professor", "category"],
            select: {
                id: true,
                title: true,
                description: true,
                professorId: true,
                categoryId: true,
                createdAt: true,
                updatedAt: true,
                professor: {
                    id: true,
                    name: true,
                    email: true,
                },
                category: {
                    id: true,
                    name: true,
                    color: true,
                },
            },
        })
    }
}