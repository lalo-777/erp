import { Router } from 'express';
import {
  getAllRequisitions,
  getRequisitionById,
  getFuelStats,
  getConsumptionReport,
  createRequisition,
  updateRequisition,
  updateRequisitionStatus,
  deleteRequisition,
} from '../controllers/fuel-requisitions.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Specific routes FIRST (before parameterized routes)
router.get('/stats', getFuelStats);
router.get('/consumption-report', getConsumptionReport);

// CRUD routes
router.get('/', getAllRequisitions);
router.get('/:id', getRequisitionById);
router.post('/', createRequisition);
router.put('/:id', updateRequisition);
router.patch('/:id/status', updateRequisitionStatus);
router.delete('/:id', deleteRequisition);

export default router;
