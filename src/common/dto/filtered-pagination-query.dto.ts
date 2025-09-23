import { IntersectionType } from '@nestjs/swagger';
import { DateRangeFilterDto } from './date-range-filter.dto';
import { PaginationQueryDto } from './pagination-query.dto';

export class FilteredPaginationQueryDto extends IntersectionType(
  PaginationQueryDto,
  DateRangeFilterDto,
) {}
