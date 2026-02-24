/**
 * Column length constraints used across entities.
 */
export const COLUMN_LENGTHS = {
  USER_NAME: 100,
  CATEGORY_NAME: 100,
  CATEGORY_COLOR: 7,
  FILENAME: 500,
  ORIGINAL_NAME: 500,
  MIMETYPE: 100,
} as const;

/**
 * Number of bcrypt salt rounds used for password hashing.
 */
export const PASSWORD_SALT_ROUNDS = 10;

/**
 * Validation constraints for DTOs.
 */
export const VALIDATION_CONSTRAINTS = {
  COURSE_TITLE_MIN_LENGTH: 3,
  COURSE_DESCRIPTION_MIN_LENGTH: 10,
  LESSON_RESOURCE_TITLE_MAX_LENGTH: 255,
  LESSON_RESOURCE_DESCRIPTION_MAX_LENGTH: 1000,
} as const;

/**
 * Percentage multiplier for completion/score calculations.
 */
export const PERCENTAGE_MULTIPLIER = 100;

/**
 * Network-related constants.
 */
export const NETWORK = {
  DEFAULT_DB_PORT: 3306,
} as const;

/**
 * Radix for parsing database port numbers.
 */
export const DATABASE_PORT_RADIX = 10;

/**
 * Test/demo data used by admin controller.
 */
export const TEST_DATA = {
  TOTAL_COURSES: 25,
} as const;
