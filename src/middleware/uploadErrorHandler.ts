import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import multer from 'multer';
import { Logger } from '../services/logger/Logger';

const logger = new Logger('UploadErrorHandler');

export const uploadErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    return next();
  }

  logger.error('Upload error:', err);

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return next(new ApiError(400, 'File too large'));
      case 'LIMIT_FILE_COUNT':
        return next(new ApiError(400, 'Too many files'));
      case 'LIMIT_UNEXPECTED_FILE':
        return next(new ApiError(400, 'Invalid file field name. Please use "file" as the field name.'));
      default:
        return next(new ApiError(400, `File upload error: ${err.message}`));
    }
  }
  
  if (err instanceof ApiError) {
    return next(err);
  }
  
  next(new ApiError(500, 'Internal server error during file upload'));
}; 