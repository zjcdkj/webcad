import { Router } from 'express';
import { FolderController } from '../controllers/FolderController';

const router = Router();

export default (folderController: FolderController) => {
  /**
   * @swagger
   * /api/folders:
   *   post:
   *     tags: [Folders]
   *     summary: Create a new folder
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               parentId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Folder created successfully
   */
  router.post('/folders', folderController.createFolder.bind(folderController));

  /**
   * @swagger
   * /api/folders/{folderId}:
   *   patch:
   *     tags: [Folders]
   *     summary: Rename a folder
   *     parameters:
   *       - in: path
   *         name: folderId
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
   *               name:
   *                 type: string
   *     responses:
   *       200:
   *         description: Folder renamed successfully
   */
  router.patch('/folders/:folderId', folderController.renameFolder.bind(folderController));

  /**
   * @swagger
   * /api/folders/{folderId}:
   *   delete:
   *     tags: [Folders]
   *     summary: Delete a folder
   *     parameters:
   *       - in: path
   *         name: folderId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Folder deleted successfully
   */
  router.delete('/folders/:folderId', folderController.deleteFolder.bind(folderController));

  /**
   * @swagger
   * /api/folders/{folderId}/contents:
   *   get:
   *     tags: [Folders]
   *     summary: Get folder contents
   *     parameters:
   *       - in: path
   *         name: folderId
   *         required: true
   *         schema:
   *           type: string
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
   *         description: Folder contents retrieved successfully
   */
  router.get('/folders/:folderId/contents', folderController.getFolderContents.bind(folderController));

  return router;
}; 