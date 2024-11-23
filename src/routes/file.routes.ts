import { Router } from 'express';
import { FileController } from '../controllers/FileController';
import { uploadMiddleware } from '../middleware/multer';
import { Logger } from '../services/logger/Logger';

const router = Router();
const logger = new Logger('FileRoutes');

export default (fileController: FileController) => {
  /**
   * @swagger
   * /api/files:
   *   post:
   *     tags: [Files]
   *     summary: Upload a CAD file
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: File uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/UploadedFile'
   */
  router.post(
    '/files',
    uploadMiddleware,
    fileController.uploadFile.bind(fileController)
  );

  /**
   * @swagger
   * /api/files/{fileId}/download:
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
   *         content:
   *           application/octet-stream:
   *             schema:
   *               type: string
   *               format: binary
   */
  router.get(
    '/files/:fileId/download',
    fileController.downloadFile.bind(fileController)
  );

  /**
   * @swagger
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
   */
  router.delete(
    '/files/:fileId',
    fileController.deleteFile.bind(fileController)
  );

  /**
   * @swagger
   * /api/files/{fileId}/filename:
   *   patch:
   *     tags: [Files]
   *     summary: Update file name
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               filename:
   *                 type: string
   *     responses:
   *       200:
   *         description: File name updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/UploadedFile'
   */
  router.patch(
    '/files/:fileId/filename',
    fileController.updateFileName.bind(fileController)
  );

  /**
   * @swagger
   * /api/files:
   *   get:
   *     tags: [Files]
   *     summary: List all files
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: Files retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     files:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/UploadedFile'
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         total:
   *                           type: integer
   */
  router.get(
    '/files',
    fileController.listFiles.bind(fileController)
  );

  return router;
}; 