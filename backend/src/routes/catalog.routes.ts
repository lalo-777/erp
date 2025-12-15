import { Router } from 'express';
import {
  getAllCatalogs,
  getCatalogEntries,
  getCatalogEntryById,
  createCatalogEntry,
  updateCatalogEntry,
  deleteCatalogEntry,
} from '../controllers/catalog.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get list of all available catalogs
router.get('/', getAllCatalogs);

// Catalog-specific routes
router.get('/:catalogName', getCatalogEntries);
router.get('/:catalogName/:id', getCatalogEntryById);
router.post('/:catalogName', createCatalogEntry);
router.put('/:catalogName/:id', updateCatalogEntry);
router.delete('/:catalogName/:id', deleteCatalogEntry);

export default router;
