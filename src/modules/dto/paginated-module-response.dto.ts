import { ApiProperty } from '@nestjs/swagger';
import { ModuleResponseDto } from './module-response.dto';

class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Total number of items available' })
  total: number;

  @ApiProperty({
    example: true,
    description: 'Indicates if there are more pages available',
  })
  hasMore: boolean;
}

export class PaginatedModuleResponseDto {
  @ApiProperty({ isArray: true, type: ModuleResponseDto })
  items: ModuleResponseDto[];

  @ApiProperty({ type: () => PaginationMetaDto })
  meta: PaginationMetaDto;
}
