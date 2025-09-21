import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateObjectiveDto } from './create-objective.dto';

export class UpdateObjectiveDto extends PartialType(CreateObjectiveDto) {
  @IsOptional()
  @IsUUID('4')
  courseId?: string;
}
