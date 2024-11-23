import { Request, Response } from 'express';
import { StorageService } from '../services/storage/StorageService';
import { FileService } from '../services/file/FileService';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../services/logger/Logger';
import { toISOString } from '../utils/dateFormatter';

export class FileController {
  private logger: Logger;

  constructor(
    private storageService: StorageService,
    private fileService: FileService
  ) {
    this.logger = new Logger('FileController');
  }

  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
      }

      const { folderId } = req.body;
      if (!folderId) {
        throw new ApiError(400, 'Folder ID is required');
      }

      const savedFile = await this.storageService.saveFile(req.file);
      
      const file = await this.fileService.createFile(savedFile, folderId);
      
      res.status(201).json({
        success: true,
        data: {
          id: file.id,
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          status: file.status,
          createdAt: toISOString(file.createdAt),
          metadata: file.metadata ? {
            format: file.metadata.format,
            lastModified: file.metadata.lastModified 
              ? toISOString(file.metadata.lastModified)
              : undefined
          } : undefined
        }
      });
    } catch (error) {
      this.logger.error('Upload file failed:', error);
      throw error;
    }
  }

  async downloadFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      
      // 获取文件记录
      const fileRecord = await this.fileService.getFile(fileId);
      if (!fileRecord) {
        throw new ApiError(404, `File not found with id: ${fileId}`);
      }

      try {
        // 从 MinIO 下载文件
        const fileBuffer = await this.storageService.getFile(fileRecord.path);

        // 使用 encodeURIComponent 处理中文文件名
        const encodedFilename = encodeURIComponent(fileRecord.originalname)
          .replace(/['()]/g, escape) // 处理特殊字符
          .replace(/\*/g, '%2A');

        // 设置响应头，支持中文文件名
        res.setHeader('Content-Type', fileRecord.mimetype);
        res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`);
        res.send(fileBuffer);
      } catch (error) {
        this.logger.error(`Failed to download file from storage: ${fileRecord.path}`, error);
        throw new ApiError(500, 'Failed to download file from storage');
      }
    } catch (error) {
      this.logger.error('Download file failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Download failed');
    }
  }

  async deleteFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      
      // 获取文件记录
      const fileRecord = await this.fileService.getFile(fileId);
      if (!fileRecord) {
        throw new ApiError(404, 'File not found');
      }

      // 从 MinIO 删除文件
      await this.storageService.deleteFile(fileRecord.path);
      
      // 从数据库删除记录
      await this.fileService.deleteFile(fileId);

      res.status(204).send();
    } catch (error) {
      this.logger.error('Delete file failed:', error);
      throw new ApiError(500, error instanceof Error ? error.message : 'Delete failed');
    }
  }

  async updateFileName(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      const { filename } = req.body;

      if (!filename) {
        throw new ApiError(400, 'Filename is required');
      }

      const updatedFile = await this.fileService.updateFileName(fileId, filename);
      if (!updatedFile) {
        throw new ApiError(404, 'File not found');
      }

      res.json({
        success: true,
        data: updatedFile
      });
    } catch (error) {
      this.logger.error('Update filename failed:', error);
      throw new ApiError(500, error instanceof Error ? error.message : 'Update failed');
    }
  }

  async listFiles(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, folderId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const files = await this.fileService.listFiles(
        folderId as string | null,
        skip,
        Number(limit)
      );
      const total = await this.fileService.countFiles(folderId as string);

      res.json({
        success: true,
        data: {
          files: files.map(file => ({
            id: file.id,
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
            status: file.status,
            createdAt: toISOString(file.createdAt),
            metadata: file.metadata ? {
              format: file.metadata.format,
              lastModified: file.metadata.lastModified 
                ? toISOString(file.metadata.lastModified)
                : undefined
            } : undefined
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total
          }
        }
      });
    } catch (error) {
      this.logger.error('List files failed:', error);
      throw error;
    }
  }
} 