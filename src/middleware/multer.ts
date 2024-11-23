import multer from 'multer';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../services/logger/Logger';

const logger = new Logger('Multer');

// 创建内存存储
const storage = multer.memoryStorage();

// 创建 multer 实例
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    try {
      // 使用 UTF-8 解码文件名
      const decodedFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
      logger.info(`Receiving file: ${decodedFilename}`);
      
      // 检查文件扩展名
      const fileExt = decodedFilename.split('.').pop()?.toLowerCase();
      if (!fileExt || !['dwg', 'dxf'].includes(fileExt)) {
        return cb(new Error('Invalid file type. Only .dwg and .dxf files are allowed.'));
      }

      // 更新原始文件名为解码后的版本
      file.originalname = decodedFilename;
      cb(null, true);
    } catch (error) {
      logger.error('File name decode error:', error);
      cb(new Error('Invalid file name encoding'));
    }
  }
}).single('file');

// 导出中间件函数
export const uploadMiddleware = (req: any, res: any, next: any) => {
  upload(req, res, (err: any) => {
    if (err) {
      logger.error('Multer error:', err);
      if (err instanceof multer.MulterError) {
        return next(new ApiError(400, err.message));
      }
      return next(new ApiError(400, err.message));
    }

    // 确保文件已上传
    if (!req.file) {
      return next(new ApiError(400, 'No file uploaded'));
    }

    next();
  });
}; 