import { IsBoolean, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { VALIDATION_CONSTRAINTS } from '../../common/constants';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(VALIDATION_CONSTRAINTS.COURSE_TITLE_MIN_LENGTH)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(VALIDATION_CONSTRAINTS.COURSE_DESCRIPTION_MIN_LENGTH)
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  syllabus?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  professorId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
