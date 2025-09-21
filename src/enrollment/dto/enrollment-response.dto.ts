// dto/enrollment-response.dto.ts
export class EnrollmentResponseDto {
  id: string;
  userId: string;
  courseId: string;
  courseTitle?: string; // optional, if you want to expose course info
  enrolledAt: Date;
  isActive: boolean;
}

export class UserEnrollmentsResponseDto {
  userId: string;
  enrollments: EnrollmentResponseDto[];
}
