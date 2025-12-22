import { Router } from 'express';
import {
  createPost,
  getPostsByEntity,
  getReplies,
  updatePost,
  deletePost,
  searchUsers,
} from '../controllers/chatter.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Search users for mentions
router.get('/users/search', searchUsers);

// Get posts by entity (section_id + foreign_id)
router.get('/posts/:section_id/:foreign_id', getPostsByEntity);

// Get replies to a post
router.get('/posts/:id/replies', getReplies);

// CRUD routes
router.post('/posts', createPost);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

export default router;
