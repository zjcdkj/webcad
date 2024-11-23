export type FileStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface FileMetadata {
  width?: number;
  height?: number;
  format?: string;
  layers?: string[];
  createdBy?: string;
  lastModified?: Date;
  version?: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  folderId: string;
  status: FileStatus;
  createdAt: Date;
  metadata?: FileMetadata;
}

export interface File {
  id: string;
  name: string;
  path: string;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFileDto {
  name: string;
  folderId: string;
}

export interface UpdateFileDto {
  name: string;
}

export interface FileResponse {
  id: string;
  filename: string;
  originalname: string;
  size: number;
  status: FileStatus;
  createdAt: string;
  metadata?: {
    format?: string;
    lastModified?: string;
  };
} 