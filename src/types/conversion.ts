export type ConversionStatus = 'pending' | 'converting' | 'optimizing' | 'saving' | 'completed' | 'failed';

export interface ConversionJob {
  id: string;
  fileId: string;
  status: ConversionStatus;
  error?: string;
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
} 