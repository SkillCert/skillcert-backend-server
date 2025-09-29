import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DateRangeFilterDto } from '../common/dto/date-range-filter.dto';
import { Category } from '../entities/category.entity';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category name already exists
    const nameExists = await this.categoriesRepository.nameExists(
      createCategoryDto.name,
    );
    if (nameExists) {
      throw new ConflictException('Category name already exists');
    }

    return await this.categoriesRepository.create(createCategoryDto);
  }

  async findAll(
    page?: number,
    limit?: number,
    filters?: DateRangeFilterDto,
  ): Promise<{ categories: Category[]; total: number }> {
    return await this.categoriesRepository.findAll(page, limit, filters);
  }

  async findCategoryById(id: string): Promise<Category> {
    if (!id) {
      throw new BadRequestException('Category ID is required');
    }

    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    if (!id) {
      throw new BadRequestException('Category ID is required');
    }

    // Check if category exists
    const categoryExists = await this.categoriesRepository.exists(id);
    if (!categoryExists) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if name is being updated and if it already exists
    if (updateCategoryDto.name) {
      const nameExists = await this.categoriesRepository.nameExists(
        updateCategoryDto.name,
        id,
      );
      if (nameExists) {
        throw new ConflictException('Category name already exists');
      }
    }

    const updatedCategory = await this.categoriesRepository.update(
      id,
      updateCategoryDto,
    );
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('Category ID is required');
    }

    const categoryExists = await this.categoriesRepository.exists(id);
    if (!categoryExists) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has associated courses
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.courses && category.courses.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with associated courses',
      );
    }

    const deleted = await this.categoriesRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async findActiveCategories(): Promise<Category[]> {
    return await this.categoriesRepository.findActiveCategories();
  }

  async getCategoryCoursesCount(id: string): Promise<number> {
    if (!id) {
      throw new BadRequestException('Category ID is required');
    }

    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category.courses ? category.courses.length : 0;
  }
}
