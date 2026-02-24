/**
 * Application-wide constants
 */

// Database column length constraints
export const COLUMN_LENGTHS = {
  USER_NAME: 100,
  CATEGORY_NAME: 100,
  CATEGORY_DESCRIPTION: 500,
  CATEGORY_COLOR: 7,
  COURSE_TITLE: 200,
  COURSE_DESCRIPTION: 2000,
  LESSON_TITLE: 200,
  LESSON_CONTENT: 10000,
  RESOURCE_TITLE: 200,
  RESOURCE_URL: 500,
  FILENAME: 255,
  ORIGINAL_NAME: 255,
  MIMETYPE: 100,
} as const;

// Validation constraints for DTOs
export const VALIDATION_CONSTRAINTS = {
  COURSE_TITLE_MIN_LENGTH: 3,
  COURSE_DESCRIPTION_MIN_LENGTH: 10,
  LESSON_RESOURCE_TITLE_MAX_LENGTH: 200,
  LESSON_RESOURCE_DESCRIPTION_MAX_LENGTH: 1000,
} as const;

// Password hashing
export const PASSWORD_SALT_ROUNDS = 10;

// Percentage calculations
export const PERCENTAGE_MULTIPLIER = 100;

// Quiz settings
export const QUIZ_PASSING_THRESHOLD = 70;

// Database configuration
export const DATABASE_PORT_RADIX = 10;

// Network configuration
export const NETWORK = {
  DEFAULT_DB_PORT: 3306,
  DEFAULT_APP_PORT: 3000,
} as const;

// Test data for development/testing
export const TEST_DATA = {
  SAMPLE_USER_ID: '00000000-0000-0000-0000-000000000001',
  SAMPLE_COURSE_ID: '00000000-0000-0000-0000-000000000002',
  TOTAL_COURSES: 100,
  TOTAL_USERS: 500,
  TOTAL_ENROLLMENTS: 1200,
} as const;
