import { Router } from 'express';
import {
  getEntityHistory,
  getStatusHistory,
} from '../controllers/history.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get full history for an entity (chatter + notes + files)
router.get('/:section_id/:foreign_id', getEntityHistory);

// Get status changes for an entity
router.get('/:section_id/:foreign_id/status', getStatusHistory);

export default router;
