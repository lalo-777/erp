import { Router } from 'express';
import {
  uploadFile,
  getFilesByEntity,
  getFileById,
  downloadFile,
  updateFile,
  deleteFile,
} from '../controllers/files.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../config/multer';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload file (uses multer middleware)
router.post('/upload', upload.single('file'), uploadFile);

// Get files by entity (section_id + foreign_id)
router.get('/entity/:section_id/:foreign_id', getFilesByEntity);

// Download file
router.get('/:id/download', downloadFile);

// Get, update, delete file
router.get('/:id', getFileById);
router.put('/:id', updateFile);
router.delete('/:id', deleteFile);

export default router;
