import { Router } from 'express';
import {
  createNote,
  getNotesByEntity,
  getNoteById,
  updateNote,
  deleteNote,
  getNotesByUser,
} from '../controllers/notes.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get notes by user
router.get('/my-notes', getNotesByUser);

// Get notes by entity (section_id + foreign_id)
router.get('/entity/:section_id/:foreign_id', getNotesByEntity);

// CRUD routes
router.post('/', createNote);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
