import Bull, { Job } from 'bull';
import { IConverter } from '../../types/converter';
import { Logger } from '../logger/Logger';
import { FileService } from '../file/FileService';
import { StorageService } from '../storage/StorageService';
import { ConversionJob, ConversionStatus, ConversionOptions } from '../../types/conversion';
import { ApiError } from '../../utils/ApiError';
import { UploadedFile } from '../../types/file';

export class ConversionService {
  private logger: Logger;
  private readonly DEFAULT_MAX_ATTEMPTS = 3;
  private readonly DEFAULT_TIMEOUT = 300000; // 5分钟

  constructor(
    private converter: IConverter,
    private queue: Bull,
    private fileService: FileService,
    private storageService: StorageService
  ) {
    this.logger = new Logger('ConversionService');
    this.initializeQueue();
    this.cleanOldJobs();
  }

  private async cleanOldJobs() {
    try {
      const jobs = await this.queue.getJobs(['active', 'waiting', 'delayed', 'failed']);
      for (const job of jobs) {
        await job.remove();
      }
      this.logger.info('Cleaned up old jobs');
    } catch (error) {
      this.logger.error('Failed to clean old jobs:', error);
    }
  }

  private initializeQueue() {
    this.queue.process(async (job: Job) => {
      const { fileId } = job.data;
      
      try {
        await this.updateJobProgress(job, 0);
        
        // 1. 从 MinIO 获取原始文件
        const file = await this.fileService.getFile(fileId);
        if (!file) {
          throw new Error(`File not found: ${fileId}`);
        }

        const fileBuffer = await this.storageService.getFile(file.path);
        await this.updateJobProgress(job, 20);

        // 2. 使用转换器转换文件
        const convertedData = await this.converter.convert(fileBuffer);
        await this.updateJobProgress(job, 60);

        // 3. 保存转换结果
        const outputPath = `converted/${file.id}/data.json`;
        const convertedBuffer = Buffer.from(JSON.stringify(convertedData));
        
        const convertedFile: UploadedFile = {
          id: `${file.id}_converted`,
          filename: 'data.json',
          originalname: 'data.json',
          mimetype: 'application/json',
          size: convertedBuffer.length,
          path: outputPath,
          status: 'completed',
          createdAt: new Date(),
          metadata: {
            format: 'JSON',
            lastModified: new Date(),
            layers: convertedData.layers.map(layer => layer.name)
          }
        };

        await this.storageService.saveFile({
          originalname: convertedFile.originalname,
          buffer: convertedBuffer,
          mimetype: convertedFile.mimetype,
          size: convertedFile.size,
          filename: convertedFile.filename,
          path: convertedFile.path,
          fieldname: 'file'
        } as Express.Multer.File);

        await this.updateJobProgress(job, 80);

        // 4. 更新文件状态
        await this.fileService.updateFileStatus(fileId, 'completed');
        await this.updateJobProgress(job, 100);

        return {
          status: 'completed' as ConversionStatus,
          outputPath
        };
      } catch (error) {
        this.logger.error(`Conversion failed for file ${fileId}:`, error);
        await this.fileService.updateFileStatus(fileId, 'failed');
        throw error;
      }
    });
  }

  private async updateJobProgress(job: Job, progress: number): Promise<void> {
    try {
      await job.progress(progress);
      await job.update({
        ...job.data,
        progress,
        updatedAt: new Date()
      });
    } catch (error) {
      this.logger.error(`Failed to update job progress for job ${job.id}:`, error);
    }
  }

  async startConversion(fileId: string, options: ConversionOptions = {}): Promise<string> {
    const file = await this.fileService.getFile(fileId);
    if (!file) {
      throw new ApiError(404, 'File not found');
    }

    // 检查是否已有相同文件的转换任务
    const existingJobs = await this.queue.getJobs(['active', 'waiting', 'delayed']);
    const existingJob = existingJobs.find((job: Job) => job.data.fileId === fileId);
    if (existingJob) {
      return existingJob.id;
    }

    const job = await this.queue.add({
      fileId,
      status: 'pending',
      progress: 0,
      attempts: 0,
      maxAttempts: options.maxAttempts || this.DEFAULT_MAX_ATTEMPTS,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      attempts: options.maxAttempts || this.DEFAULT_MAX_ATTEMPTS,
      timeout: options.timeout || this.DEFAULT_TIMEOUT,
      priority: options.priority,
      removeOnComplete: false,
      removeOnFail: false
    });

    return job.id;
  }

  async getConversionStatus(jobId: string): Promise<ConversionJob | null> {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    let progress = 0;

    try {
      // 修改这里：直接传递 0 作为参数
      const progressData = await job.progress(0);
      progress = typeof progressData === 'number' ? progressData : 0;
    } catch (error) {
      this.logger.error(`Failed to get progress for job ${jobId}:`, error);
    }

    return {
      id: job.id,
      ...job.data,
      status: state as ConversionStatus,
      progress
    };
  }

  async retryConversion(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new ApiError(404, 'Conversion job not found');
    }

    await job.retry();
  }

  async getConvertedFile(jobId: string): Promise<Buffer> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new ApiError(404, 'Conversion job not found');
    }

    const result = await job.finished();
    if (!result || !result.outputPath) {
      throw new ApiError(400, 'Conversion not completed');
    }

    return await this.storageService.getFile(result.outputPath);
  }

  async deleteConversion(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new ApiError(404, 'Conversion job not found');
    }

    // 删除转换结果文件
    const result = await job.finished();
    if (result && result.outputPath) {
      await this.storageService.deleteFile(result.outputPath);
    }

    // 删除作业
    await job.remove();
  }
}