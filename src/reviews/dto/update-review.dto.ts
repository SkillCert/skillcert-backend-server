import { IsNotEmpty, Max, Min } from "class-validator"

export class UpdateReviewDto {

    title?: string

    content?: string

    @IsNotEmpty()
    @Max(5)
    @Min(1)
    rating: number
}
