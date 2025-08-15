import { IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  title?: string;

  content?: string;

  @IsNotEmpty()
  rating: number;
}
