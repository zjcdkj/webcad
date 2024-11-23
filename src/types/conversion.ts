export type ConversionStatus = 'pending' | 'converting' | 'optimizing' | 'completed' | 'failed';

export interface ConversionJob {
  id: string;
  fileId: string;
  status: ConversionStatus;
  error?: string;
  progress: number;
  attempts: number;
  maxAttempts: number;
  outputPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversionResult {
  jobId: string;
  fileId: string;
  status: ConversionStatus;
  progress: number;
  outputPath?: string;
  error?: string;
}

export interface ConversionOptions {
  maxAttempts?: number;
  timeout?: number;
  priority?: number;
} 