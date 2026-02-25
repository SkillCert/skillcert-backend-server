// Column length constraints used in entity definitions
export const COLUMN_LENGTHS = {
  USER_NAME: 100,
  TITLE: 255,
  URL: 2048,
  SHORT_TEXT: 100,
  FILENAME: 255,
  ORIGINAL_NAME: 255,
  MIMETYPE: 100,
  CATEGORY_NAME: 100,
  CATEGORY_COLOR: 50,
};

// Validation constraints used in DTOs
export const VALIDATION_CONSTRAINTS = {
  MAX_TITLE_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_URL_LENGTH: 2048,
  MIN_PASSWORD_LENGTH: 8,
  LESSON_RESOURCE_TITLE_MAX_LENGTH: 255,
  LESSON_RESOURCE_DESCRIPTION_MAX_LENGTH: 1000,
  COURSE_TITLE_MIN_LENGTH: 3,
  COURSE_DESCRIPTION_MIN_LENGTH: 10,
};

// Bcrypt salt rounds for password hashing
export const PASSWORD_SALT_ROUNDS = 10;

// Percentage multiplier (100)
export const PERCENTAGE_MULTIPLIER = 100;

// Quiz passing threshold percentage
export const QUIZ_PASSING_THRESHOLD = 70;

// Test/mock data for admin dashboard
export const TEST_DATA = {
  TOTAL_COURSES: 25,
};

// Network configuration
export const NETWORK = {
  DEFAULT_DB_PORT: 5432,
  DEFAULT_PORT: 3000,
};

// Radix used when parsing the DB port string to number
export const DATABASE_PORT_RADIX = 10;
