import { Queue, Job } from 'bull';
import { promises as fs } from 'fs';
import { IConverter } from '../../types/converter';
import { ConversionStatus, ConversionJob } from '../../types/conversion';
import { UploadedFile } from '../../types/file';
import { DataOptimizer } from '../optimizer/DataOptimizer';
import { StorageService } from '../storage/StorageService';
import { Logger } from '../logger/Logger';

export class ConversionService {
  private logger: Logger;

  constructor(
    private converter: IConverter,
    private queue: Queue<ConversionJob>,
    private optimizer: DataOptimizer,
    private storage: StorageService
  ) {
    this.logger = new Logger('ConversionService');
  }

  async convertFile(file: UploadedFile): Promise<string> {
    let job: Job<ConversionJob> | undefined;
    
    try {
      // 1. 添加到转换队列
      job = await this.queue.add({
        fileId: file.id,
        filePath: file.path,
        status: 'pending'
      });

      // 2. 执行转换
      await job.update({ status: 'converting' });
      const intermediateFormat = await this.converter.convert(file.path);

      // 3. 优化数据
      await job.update({ status: 'optimizing' });
      const optimized = await this.optimizer.optimize(intermediateFormat);

      // 4. 存储转换结果
      await job.update({ status: 'saving' });
      await this.storage.save(file.id, optimized);

      // 5. 清理临时文件
      await this.cleanup(file.path);

      await job.update({ status: 'completed' });
      return job.id;

    } catch (error) {
      if (job) {
        await job.update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      throw error;
    }
  }

  async getConversionStatus(jobId: string): Promise<ConversionStatus> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return job.data.status;
  }

  private async cleanup(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.error(`Failed to cleanup file ${filePath}:`, error);
    }
  }
} 