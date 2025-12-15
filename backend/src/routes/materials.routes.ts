import { Router } from 'express';
import {
  getAllMaterials,
  getMaterialById,
  getLowStockMaterials,
  getMaterialStats,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../controllers/materials.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Specific routes FIRST (before parameterized routes)
router.get('/stats', getMaterialStats);
router.get('/low-stock', getLowStockMaterials);

// CRUD routes
router.get('/', getAllMaterials);
router.get('/:id', getMaterialById);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

export default router;
