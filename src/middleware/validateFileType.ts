import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../services/logger/Logger';

const logger = new Logger('ValidateFileType');

/**
 * 创建文件类型验证中间件
 * @param allowedTypes 允许的文件扩展名数组，例如 ['dwg', 'dxf']
 * @returns Express 中间件函数
 */
export const validateFileType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
      }

      const fileExt = req.file.originalname.split('.').pop()?.toLowerCase();
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        throw new ApiError(400, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 