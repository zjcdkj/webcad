export interface UploadedFile {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  createdAt: Date;
  status: FileStatus;
  metadata?: Record<string, any>;
}

export type FileStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface FileMetadata {
  width?: number;
  height?: number;
  format?: string;
  layers?: string[];
} 