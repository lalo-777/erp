import { Router } from 'express';
import {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
  receiveMaterials,
  getPurchaseOrderStats,
} from '../controllers/purchase-orders.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Specific routes FIRST (before parameterized routes)
router.get('/stats', getPurchaseOrderStats);

// CRUD routes
router.get('/', getAllPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', createPurchaseOrder);
router.put('/:id', updatePurchaseOrder);
router.delete('/:id', deletePurchaseOrder);

// Status and receiving routes
router.patch('/:id/status', updatePurchaseOrderStatus);
router.post('/:id/receive', receiveMaterials);

export default router;
