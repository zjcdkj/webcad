import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFile } from '../../types/file';
import { IntermediateFormat } from '../../types/IntermediateFormat';

export class StorageService {
  private uploadDir: string;

  constructor(uploadDir: string) {
    this.uploadDir = uploadDir;
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<UploadedFile> {
    const id = uuidv4();
    const fileExt = path.extname(file.originalname);
    const filename = `${id}${fileExt}`;
    const filePath = path.join(this.uploadDir, filename);

    // 移动上传的临时文件到存储目录
    await fs.rename(file.path, filePath);

    return {
      id,
      filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: filePath,
      createdAt: new Date(),
      status: 'pending'
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileId);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async getFilePath(fileId: string): Promise<string> {
    const filePath = path.join(this.uploadDir, fileId);
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      throw new Error('File not found');
    }
  }

  async save(fileId: string, data: IntermediateFormat): Promise<void> {
    const filePath = path.join(this.uploadDir, `${fileId}.json`);
    await fs.writeFile(filePath, JSON.stringify(data));
  }
} 