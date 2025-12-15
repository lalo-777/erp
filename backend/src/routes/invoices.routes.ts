import { Router } from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  getInvoiceStats,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceHistory,
} from '../controllers/invoices.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Specific routes FIRST (before parameterized routes)
router.get('/stats', getInvoiceStats);

// CRUD routes
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/history', getInvoiceHistory);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
