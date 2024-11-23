import { UploadedFile, FileMetadata, FileStatus, File } from '../../types/file';
import { Logger } from '../logger/Logger';
import mongoose, { Schema, Document } from 'mongoose';
import { FolderModel } from '../../models/folder.model';
import { ApiError } from '../../utils/ApiError';
import { v4 as uuidv4 } from 'uuid';

// 修改文件文档接口以匹配新的文件类型
interface IFileDocument extends Document {
  id: string;
  name: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  folderId: string;
  status: FileStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: FileMetadata;
}

// 定义 Metadata Schema
const FileMetadataSchema = new Schema<FileMetadata>({
  format: String,
  layers: [String],
  createdBy: String,
  lastModified: { type: Date, default: Date.now },
  version: String
});

// 更新 File Schema
const FileSchema = new Schema<IFileDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  folderId: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed']
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  metadata: FileMetadataSchema
});

// 添加索引
FileSchema.index({ folderId: 1 });
FileSchema.index({ path: 1 });

const FileModel = mongoose.model<IFileDocument>('File', FileSchema);

export class FileService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('FileService');
  }

  async createFile(file: Express.Multer.File, folderId: string): Promise<File> {
    try {
      const folder = await FolderModel.findOne({ id: folderId });
      if (!folder) {
        throw new ApiError(404, 'Folder not found');
      }

      const existingFile = await FileModel.findOne({
        folderId,
        name: file.originalname
      });

      if (existingFile) {
        throw new ApiError(400, 'File with this name already exists in this folder');
      }

      const id = uuidv4();
      const filePath = `${folder.path}/${file.originalname}`;

      const fileDoc = await FileModel.create({
        id,
        name: file.originalname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath,
        folderId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        id: fileDoc.id,
        name: fileDoc.name,
        path: fileDoc.path,
        folderId: fileDoc.folderId,
        createdAt: fileDoc.createdAt,
        updatedAt: fileDoc.updatedAt
      };
    } catch (error) {
      this.logger.error('Failed to create file:', error);
      throw error;
    }
  }

  // 修改 mapToFile 方法以返回完整的文件信息
  private mapToFile(doc: IFileDocument): UploadedFile {
    return {
      id: doc.id,
      filename: doc.name,
      originalname: doc.originalname,
      mimetype: doc.mimetype,
      size: doc.size,
      path: doc.path,
      status: doc.status,
      createdAt: doc.createdAt,
      metadata: doc.metadata
    };
  }

  // 修改返回类型
  async getFile(fileId: string): Promise<UploadedFile | null> {
    try {
      const fileDoc = await FileModel.findOne({ id: fileId });
      return fileDoc ? this.mapToFile(fileDoc) : null;
    } catch (error) {
      this.logger.error('Failed to get file:', error);
      throw error;
    }
  }

  async updateFileName(fileId: string, name: string): Promise<File | null> {
    try {
      const fileDoc = await FileModel.findOneAndUpdate(
        { id: fileId },
        { 
          name,
          updatedAt: new Date()
        },
        { new: true }
      );
      return fileDoc ? this.mapToFile(fileDoc) : null;
    } catch (error) {
      this.logger.error('Failed to update file name:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await FileModel.deleteOne({ id: fileId });
    } catch (error) {
      this.logger.error('Failed to delete file:', error);
      throw error;
    }
  }

  // 修改列表方法
  async listFiles(folderId: string | null, skip: number, limit: number): Promise<UploadedFile[]> {
    try {
      const files = await FileModel.find(folderId ? { folderId } : {})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      return files.map(this.mapToFile);
    } catch (error) {
      this.logger.error('Failed to list files:', error);
      throw error;
    }
  }

  // 修改计数方法
  async countFiles(folderId?: string): Promise<number> {
    try {
      return await FileModel.countDocuments(folderId ? { folderId } : {});
    } catch (error) {
      this.logger.error('Failed to count files:', error);
      throw error;
    }
  }
} 