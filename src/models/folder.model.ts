import mongoose, { Schema, Document } from 'mongoose';
import { Folder } from '../types/folder';

export interface IFolderDocument extends Document, Folder {}

const FolderSchema = new Schema<IFolderDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  path: { type: String, required: true },
  parentId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 添加索引以提高查询性能
FolderSchema.index({ path: 1 });
FolderSchema.index({ parentId: 1 });

export const FolderModel = mongoose.model<IFolderDocument>('Folder', FolderSchema); 