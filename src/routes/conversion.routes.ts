import { Router } from 'express';
import { ConversionController } from '../controllers/ConversionController';

const router = Router();

export default (conversionController: ConversionController) => {
  /**
   * @swagger
   * /api/files/{fileId}/convert:
   *   post:
   *     tags: [Conversions]
   *     summary: Start file conversion
   *     description: Convert a CAD file to JSON format
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the file to convert
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               options:
   *                 type: object
   *                 properties:
   *                   maxAttempts:
   *                     type: number
   *                     description: Maximum number of conversion attempts
   *                   timeout:
   *                     type: number
   *                     description: Conversion timeout in milliseconds
   *                   priority:
   *                     type: number
   *                     description: Job priority (higher number means higher priority)
   *     responses:
   *       200:
   *         description: Conversion started successfully
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
   *                     jobId:
   *                       type: string
   *                     status:
   *                       type: string
   *                       enum: [pending]
   */
  router.post('/files/:fileId/convert', conversionController.startConversion.bind(conversionController));

  /**
   * @swagger
   * /api/conversions/{jobId}:
   *   get:
   *     tags: [Conversions]
   *     summary: Get conversion status
   *     description: Get the current status of a conversion job
   *     parameters:
   *       - in: path
   *         name: jobId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the conversion job
   *     responses:
   *       200:
   *         description: Conversion status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/ConversionJob'
   */
  router.get('/conversions/:jobId', conversionController.getStatus.bind(conversionController));

  /**
   * @swagger
   * /api/conversions/{jobId}/retry:
   *   post:
   *     tags: [Conversions]
   *     summary: Retry conversion
   *     description: Retry a failed conversion job
   *     parameters:
   *       - in: path
   *         name: jobId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the conversion job to retry
   *     responses:
   *       200:
   *         description: Conversion retry started successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   */
  router.post('/conversions/:jobId/retry', conversionController.retryConversion.bind(conversionController));

  /**
   * @swagger
   * /api/conversions/{jobId}/download:
   *   get:
   *     tags: [Conversions]
   *     summary: Download converted file
   *     description: Download the converted JSON file
   *     parameters:
   *       - in: path
   *         name: jobId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the conversion job
   *     responses:
   *       200:
   *         description: File downloaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: string
   *               format: binary
   */
  router.get('/conversions/:jobId/download', conversionController.downloadConvertedFile.bind(conversionController));

  /**
   * @swagger
   * /api/conversions/{jobId}:
   *   delete:
   *     tags: [Conversions]
   *     summary: Delete conversion
   *     description: Delete a conversion job and its associated files
   *     parameters:
   *       - in: path
   *         name: jobId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the conversion job to delete
   *     responses:
   *       204:
   *         description: Conversion deleted successfully
   */
  router.delete('/conversions/:jobId', conversionController.deleteConversion.bind(conversionController));

  return router;
}; 