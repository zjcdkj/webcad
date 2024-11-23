import { Client, CopyConditions, BucketItemCopy } from 'minio';
import { Readable } from 'stream';
import { Logger } from '../logger/Logger';
import { config } from '../../config';

export class MinioService {
  private client: Client;
  private logger: Logger;
  private bucket: string;

  constructor() {
    this.logger = new Logger('MinioService');
    this.bucket = config.minio.bucket;

    this.client = new Client({
      endPoint: config.minio.url,
      port: config.minio.port,
      useSSL: config.minio.secure,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey
    });

    this.initializeBucket().catch(error => {
      this.logger.error('Failed to initialize MinIO bucket:', error);
      throw error;
    });
  }

  private async initializeBucket(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.info(`Bucket ${this.bucket} created successfully`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize bucket:', error);
      throw error;
    }
  }

  async uploadFile(objectName: string, buffer: Buffer, metadata?: any): Promise<void> {
    try {
      await this.client.putObject(
        this.bucket,
        objectName,
        buffer,
        metadata
      );
      this.logger.info(`File ${objectName} uploaded successfully`);
    } catch (error) {
      this.logger.error(`Failed to upload file ${objectName}:`, error);
      throw error;
    }
  }

  async downloadFile(objectName: string): Promise<Buffer> {
    try {
      this.logger.info(`Downloading file: ${objectName}`);
      
      // 先检查文件是否存在
      try {
        await this.client.statObject(this.bucket, objectName);
      } catch (error) {
        this.logger.error(`File not found in MinIO: ${objectName}`);
        throw new Error(`File not found in storage: ${objectName}`);
      }

      const dataStream = await this.client.getObject(this.bucket, objectName);
      return this.streamToBuffer(dataStream);
    } catch (error) {
      this.logger.error(`Failed to download file ${objectName}:`, error);
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, objectName);
      this.logger.info(`File ${objectName} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${objectName}:`, error);
      throw error;
    }
  }

  private streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async updateMetadata(objectName: string, metadata: Record<string, any>): Promise<void> {
    try {
      const stat = await this.client.statObject(this.bucket, objectName);
      const currentMetadata = stat.metaData || {};

      const newMetadata = {
        ...currentMetadata,
        ...metadata
      };

      const tempObjectName = `${objectName}_temp`;

      const conditions = new CopyConditions();
      
      await new Promise<BucketItemCopy>((resolve, reject) => {
        this.client.copyObject(
          this.bucket,
          tempObjectName,
          `${this.bucket}/${objectName}`,
          conditions,
          (err, data) => {
            if (err) reject(err);
            else resolve(data);
          }
        );
      });

      await this.client.removeObject(this.bucket, objectName);

      await new Promise<BucketItemCopy>((resolve, reject) => {
        this.client.copyObject(
          this.bucket,
          objectName,
          `${this.bucket}/${tempObjectName}`,
          conditions,
          (err, data) => {
            if (err) reject(err);
            else resolve(data);
          }
        );
      });

      await this.client.removeObject(this.bucket, tempObjectName);

      this.logger.info(`Metadata updated for ${objectName}`);
    } catch (error) {
      this.logger.error(`Failed to update metadata for ${objectName}:`, error);
      throw error;
    }
  }
} 