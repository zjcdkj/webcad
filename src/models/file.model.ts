import mongoose, { Schema, Document } from 'mongoose';
import { File } from '../types/file';

export interface IFileDocument extends Document, File {}

const FileSchema = new Schema<IFileDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  path: { type: String, required: true },
  folderId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 添加索引以提高查询性能
FileSchema.index({ path: 1 });
FileSchema.index({ folderId: 1 });

export const FileModel = mongoose.model<IFileDocument>('File', FileSchema); 