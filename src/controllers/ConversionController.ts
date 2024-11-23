import { Request, Response } from 'express';
import { ConversionService } from '../services/converter/ConversionService';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../services/logger/Logger';
import { ConversionOptions } from '../types/conversion';

export class ConversionController {
  private logger: Logger;

  constructor(private conversionService: ConversionService) {
    this.logger = new Logger('ConversionController');
  }

  async startConversion(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      const options = req.body.options || {};

      if (!fileId) {
        throw new ApiError(400, 'File ID is required');
      }

      const jobId = await this.conversionService.startConversion(fileId, options);

      res.status(200).json({
        success: true,
        data: {
          jobId,
          status: 'pending'
        }
      });
    } catch (error) {
      this.logger.error('Start conversion failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error instanceof Error ? error.message : 'Conversion failed');
    }
  }

  async getStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const status = await this.conversionService.getConversionStatus(jobId);

      if (!status) {
        throw new ApiError(404, 'Conversion job not found');
      }

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      this.logger.error('Get conversion status failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get conversion status');
    }
  }

  async retryConversion(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      await this.conversionService.retryConversion(jobId);

      res.json({
        success: true,
        message: 'Conversion retry started'
      });
    } catch (error) {
      this.logger.error('Retry conversion failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to retry conversion');
    }
  }

  async downloadConvertedFile(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const fileBuffer = await this.conversionService.getConvertedFile(jobId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="converted-${jobId}.json"`);
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Download converted file failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to download converted file');
    }
  }

  async deleteConversion(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      await this.conversionService.deleteConversion(jobId);

      res.status(204).send();
    } catch (error) {
      this.logger.error('Delete conversion failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to delete conversion');
    }
  }
} 