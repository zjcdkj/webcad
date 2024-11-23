import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../services/logger/Logger';

const logger = new Logger('ErrorHandler');

export function errorHandler(
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error occurred:', error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
} 