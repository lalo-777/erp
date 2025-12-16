import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as warehouseController from '../controllers/warehouse.controller';

const router = Router();

// All warehouse routes require authentication
router.use(authenticate);

// Warehouse locations
router.get('/locations', warehouseController.getAllWarehouseLocations);

// Stock operations
router.get('/stock/:locationId', warehouseController.getStockByLocation);
router.post('/transfer', warehouseController.transferMaterial);
router.post('/adjust', warehouseController.adjustInventory);

// Reports and history
router.get('/transactions', warehouseController.getTransactionHistory);
router.get('/transfers', warehouseController.getTransferHistory);
router.get('/stats', warehouseController.getWarehouseStats);
router.get('/report', warehouseController.getStockReport);

export default router;
