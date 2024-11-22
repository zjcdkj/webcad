import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const validateFileType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const fileExt = req.file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      throw new ApiError(400, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    next();
  };
}; 