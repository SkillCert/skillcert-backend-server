// references/dto/reference-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { LessonResponseDto } from '../../lessons/dto/lesson-response.dto';
import { ModuleResponseDto } from '../../modules/dto/module-response.dto';

export class ReferenceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  file_url: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ required: false, type: () => ModuleResponseDto })
  module?: ModuleResponseDto;

  @ApiProperty({ required: false, type: () => LessonResponseDto })
  lesson?: LessonResponseDto;

  @ApiProperty({ required: false })
  createdAt: Date;

  @ApiProperty({ required: false })
  updatedAt: Date;
}
