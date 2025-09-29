// courses/dto/course-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { ModuleResponseDto } from '../../modules/dto/module-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class CourseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: UserResponseDto })
  professor: UserResponseDto;

  @ApiProperty({ type: [ModuleResponseDto] })
  modules?: ModuleResponseDto[];

  @ApiProperty({ type: CategoryResponseDto, required: false })
  category?: CategoryResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: Number, default: 0 })
  averageRating: number;
}
