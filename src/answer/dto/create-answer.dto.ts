import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsBoolean()
  correct: boolean;
}
