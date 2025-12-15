import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  getProjectStats,
  createProject,
  updateProject,
  deleteProject,
  getProjectHistory,
} from '../controllers/projects.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Specific routes FIRST (before parameterized routes)
router.get('/stats', getProjectStats);

// CRUD routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.get('/:id/history', getProjectHistory);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
