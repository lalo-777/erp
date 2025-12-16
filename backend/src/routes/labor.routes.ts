import { Router } from 'express';
import {
  getAllTimesheets,
  getTimesheetById,
  getLaborStats,
  getPayrollReport,
  createTimesheet,
  updateTimesheet,
  updatePaymentStatus,
  deleteTimesheet,
} from '../controllers/labor.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Specific routes FIRST (before parameterized routes)
router.get('/stats', getLaborStats);
router.get('/payroll-report', getPayrollReport);

// CRUD routes
router.get('/', getAllTimesheets);
router.get('/:id', getTimesheetById);
router.post('/', createTimesheet);
router.put('/:id', updateTimesheet);
router.patch('/:id/payment-status', updatePaymentStatus);
router.delete('/:id', deleteTimesheet);

export default router;
