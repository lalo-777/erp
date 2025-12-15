import { Router } from 'express';
import {
  predictProjectCost,
  predictProjectDuration,
  segmentCustomers,
  predictEmployeeTurnover,
  optimizeInventory,
  getMLServiceHealth,
} from '../controllers/ml-analysis.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// ML prediction endpoints
router.post('/predict-project-cost', predictProjectCost);
router.post('/predict-project-duration', predictProjectDuration);
router.get('/segment-customers', segmentCustomers);
router.post('/predict-turnover', predictEmployeeTurnover);
router.post('/optimize-inventory', optimizeInventory);
router.get('/health', getMLServiceHealth);

export default router;
