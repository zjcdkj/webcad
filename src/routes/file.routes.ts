import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/FileController';
import { validateFileType } from '../middleware/validateFileType';

const upload = multer({ dest: 'uploads/' });
const router = Router();

export default (fileController: FileController) => {
  router.post(
    '/files',
    upload.single('file'),
    validateFileType(['dwg', 'dxf']),
    fileController.uploadFile.bind(fileController)
  );

  router.get(
    '/files/:fileId',
    fileController.downloadFile.bind(fileController)
  );

  router.delete(
    '/files/:fileId',
    fileController.deleteFile.bind(fileController)
  );

  return router;
}; 