import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { DatabaseExceptionFilter } from './database-exception.filter';

describe('DatabaseExceptionFilter', () => {
  let filter: DatabaseExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new DatabaseExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: '/test-url',
      method: 'POST',
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle QueryFailedError with unique_violation', () => {
    const exception = {
      code: '23505',
      message: 'duplicate',
      stack: 'stack',
    } as QueryFailedError;
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: 'Duplicate entry',
        error: 'Conflict Error',
      }),
    );
  });

  it('should handle QueryFailedError with foreign_key_violation', () => {
    const exception = {
      code: '23503',
      message: 'fk error',
      stack: 'stack',
    } as QueryFailedError;
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Related resource not found',
        error: 'Foreign Key Violation',
      }),
    );
  });

  it('should handle QueryFailedError with not_null_violation', () => {
    const exception = {
      code: '23502',
      message: 'not null',
      stack: 'stack',
    } as QueryFailedError;
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing required field',
        error: 'Not Null Violation',
      }),
    );
  });

  it('should handle QueryFailedError with invalid_text_representation', () => {
    const exception = {
      code: '22P02',
      message: 'invalid input',
      stack: 'stack',
    } as QueryFailedError;
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid input syntax',
        error: 'Invalid Input',
      }),
    );
  });

  it('should handle QueryFailedError with unknown code', () => {
    const exception = {
      code: '99999',
      message: 'unknown',
      stack: 'stack',
    } as QueryFailedError;
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database query failed',
        error: 'Query Failed',
      }),
    );
  });

  it('should handle EntityNotFoundError', () => {
    const exception = new EntityNotFoundError('Entity', {});
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Entity not found',
        error: 'Not Found',
      }),
    );
  });

  it('should handle unknown TypeORMError', () => {
    const exception = { message: 'other error', stack: 'stack' } as any;
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database error',
        error: 'Database Error',
      }),
    );
  });
});
