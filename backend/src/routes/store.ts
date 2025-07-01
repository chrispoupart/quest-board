import { Router } from 'express';
import { StoreController } from '../controllers/storeController';
import { authMiddleware, isEditorOrAdmin, isAdmin } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Get all store items (for all authenticated users)
router.get('/items', StoreController.getStoreItems);
router.get('/items/:id', StoreController.getStoreItemById);

// Purchase an item (for all authenticated users)
router.post('/purchase', StoreController.purchaseItem);
router.get('/purchases', StoreController.getUserPurchases);

// Admin/Editor routes for managing store items
router.get('/transactions/pending', isEditorOrAdmin, StoreController.getPendingTransactions);
router.put('/transactions/:id', isEditorOrAdmin, StoreController.updateTransaction);

router.post('/items', isEditorOrAdmin, StoreController.createStoreItem);
router.put('/items/:id', isEditorOrAdmin, StoreController.updateStoreItem);
router.delete('/items/:id', isAdmin, StoreController.deleteStoreItem);

export default router;
