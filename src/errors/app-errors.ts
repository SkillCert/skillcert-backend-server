interface AppError extends Error {
  isApplicationError: boolean;
  errorCode: number;
  context: Record<string, any>;
  details: Record<string, any>;
}

class AppError extends Error {
  isApplicationError: boolean = true;
  errorCode: number;
  context: Record<string, any> = {};
  details: Record<string, any> = {};

  constructor(
    message: string,
    errorCode: number = 500,
    options: {
      context?: Record<string, any>;
      details?: Record<string, any>;
    } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.errorCode = errorCode;

    if (options.context) {
      this.context = options.context;
    }

    if (options.details) {
      this.details = options.details;
    }
  }
}

export { AppError };
export default AppError;
