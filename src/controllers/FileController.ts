import { Request, Response } from 'express';
import { StorageService } from '../services/storage/StorageService';
import { FileService } from '../services/file/FileService';
import { ApiError } from '../utils/ApiError';

export class FileController {
  constructor(
    private storageService: StorageService,
    private fileService: FileService
  ) {}

  /**
   * @openapi
   * /api/files:
   *   post:
   *     tags: [Files]
   *     summary: Upload a CAD file
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - in: formData
   *         name: file
   *         type: file
   *         required: true
   *         description: The CAD file to upload
   *     responses:
   *       200:
   *         description: File uploaded successfully
   *       400:
   *         description: Invalid file format
   */
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
      }

      const file = await this.storageService.saveFile(req.file);
      const savedFile = await this.fileService.createFile(file);

      res.json(savedFile);
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  }

  /**
   * @openapi
   * /api/files/{fileId}:
   *   get:
   *     tags: [Files]
   *     summary: Download a file
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File downloaded successfully
   *       404:
   *         description: File not found
   */
  async downloadFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      const filePath = await this.storageService.getFilePath(fileId);
      res.download(filePath);
    } catch (error) {
      throw new ApiError(404, 'File not found');
    }
  }

  /**
   * @openapi
   * /api/files/{fileId}:
   *   delete:
   *     tags: [Files]
   *     summary: Delete a file
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: File deleted successfully
   *       404:
   *         description: File not found
   */
  async deleteFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      await this.fileService.deleteFile(fileId);
      await this.storageService.deleteFile(fileId);
      res.status(204).send();
    } catch (error) {
      throw new ApiError(404, 'File not found');
    }
  }
} 