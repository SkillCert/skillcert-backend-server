import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { VALIDATION_CONSTRAINTS } from '../../common/constants';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(VALIDATION_CONSTRAINTS.COURSE_TITLE_MIN_LENGTH)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(VALIDATION_CONSTRAINTS.COURSE_DESCRIPTION_MIN_LENGTH)
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  professorId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  categoryId?: string;
}
