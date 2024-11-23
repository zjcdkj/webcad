import { Request, Response } from 'express';
import { FolderService } from '../services/folder/FolderService';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../services/logger/Logger';

export class FolderController {
  private logger: Logger;

  constructor(private folderService: FolderService) {
    this.logger = new Logger('FolderController');
  }

  async createFolder(req: Request, res: Response) {
    try {
      const folder = await this.folderService.createFolder(req.body);
      res.status(201).json({
        success: true,
        data: folder
      });
    } catch (error) {
      this.logger.error('Create folder failed:', error);
      throw error;
    }
  }

  async renameFolder(req: Request, res: Response) {
    try {
      const { folderId } = req.params;
      const folder = await this.folderService.renameFolder(folderId, req.body);
      res.json({
        success: true,
        data: folder
      });
    } catch (error) {
      this.logger.error('Rename folder failed:', error);
      throw error;
    }
  }

  async deleteFolder(req: Request, res: Response) {
    try {
      const { folderId } = req.params;
      await this.folderService.deleteFolder(folderId);
      res.status(204).send();
    } catch (error) {
      this.logger.error('Delete folder failed:', error);
      throw error;
    }
  }

  async getFolderContents(req: Request, res: Response) {
    try {
      const { folderId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const contents = await this.folderService.getFolderContents(
        folderId === 'root' ? null : folderId,
        Number(page),
        Number(limit)
      );
      res.json({
        success: true,
        data: contents
      });
    } catch (error) {
      this.logger.error('Get folder contents failed:', error);
      throw error;
    }
  }
} 