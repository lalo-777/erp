import { Router } from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  getSupplierStats,
  getSupplierCategories,
  getSupplierPurchaseOrders,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/suppliers.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Specific routes FIRST (before parameterized routes)
router.get('/stats', getSupplierStats);
router.get('/categories', getSupplierCategories);

// CRUD routes
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.get('/:id/purchase-orders', getSupplierPurchaseOrders);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;
