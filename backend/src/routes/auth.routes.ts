import { Router } from 'express';
import { login, logout, changePassword, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, changePassword);

export default router;
