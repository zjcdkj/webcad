import { v4 as uuidv4 } from 'uuid';
import { UploadedFile, FileMetadata } from '../../types/file';
import { MinioService } from './MinioService';
import { Logger } from '../logger/Logger';
import { FileService } from '../file/FileService';

export class StorageService {
  private logger: Logger;
  private minioService: MinioService;
  private fileService: FileService;

  constructor() {
    this.logger = new Logger('StorageService');
    this.minioService = new MinioService();
    this.fileService = new FileService();
  }

  async saveFile(file: Express.Multer.File): Promise<Express.Multer.File> {
    try {
      const id = uuidv4();
      const fileExt = file.originalname.split('.').pop() || '';
      const objectName = `${id}.${fileExt}`;

      await this.minioService.uploadFile(
        objectName,
        file.buffer,
        {
          'Content-Type': file.mimetype,
          'x-amz-meta-originalname': file.originalname,
          'x-amz-meta-fileid': id
        }
      );

      return {
        ...file,
        filename: objectName,
        path: objectName
      };
    } catch (error) {
      this.logger.error('Failed to save file:', error);
      throw error;
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    try {
      this.logger.info(`Getting file from storage: ${filePath}`);
      const buffer = await this.minioService.downloadFile(filePath);
      if (!buffer) {
        throw new Error(`File not found in storage: ${filePath}`);
      }
      return buffer;
    } catch (error) {
      this.logger.error(`Failed to get file from storage: ${filePath}`, error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.minioService.deleteFile(filePath);
    } catch (error) {
      this.logger.error('Failed to delete file:', error);
      throw error;
    }
  }

  async updateFileMetadata(fileId: string, metadata: Partial<FileMetadata>): Promise<void> {
    try {
      const file = await this.fileService.getFile(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      // Base64 编码元数据
      const encodedMetadata = Buffer.from(JSON.stringify(metadata)).toString('base64');

      // 更新 MinIO 元数据
      await this.minioService.updateMetadata(file.path, {
        'x-amz-meta-metadata': encodedMetadata
      });

      // 更新数据库元数据
      await this.fileService.updateFileMetadata(fileId, metadata);
    } catch (error) {
      this.logger.error('Failed to update file metadata:', error);
      throw error;
    }
  }
} 