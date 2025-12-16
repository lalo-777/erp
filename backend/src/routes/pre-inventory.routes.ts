import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as preInventoryController from '../controllers/pre-inventory.controller';

const router = Router();

// All pre-inventory routes require authentication
router.use(authenticate);

// Reports and statistics (must be before /:id routes)
router.get('/reports/discrepancy', preInventoryController.getDiscrepancyReport);
router.get('/reports/stats', preInventoryController.getPreInventoryStats);

// CRUD operations
router.post('/', preInventoryController.createPreInventory);
router.get('/', preInventoryController.getAllPreInventory);
router.get('/:id', preInventoryController.getPreInventoryById);
router.delete('/:id', preInventoryController.deletePreInventory);

// Physical count operations
router.put('/:id/count', preInventoryController.updatePhysicalCount);
router.post('/:id/adjust', preInventoryController.processAdjustment);

export default router;
