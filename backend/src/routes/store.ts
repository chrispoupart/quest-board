import { Router } from 'express';
import { StoreController } from '../controllers/storeController';
import { authenticateToken, requireAdminOrEditor, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all store routes
router.use(authenticateToken);

// Public store routes (authenticated users)
router.get('/items', StoreController.getStoreItems);
router.get('/items/:id', StoreController.getStoreItemById);
router.post('/purchase', StoreController.purchaseItem);
router.get('/purchases', StoreController.getUserPurchases);

// Admin/Editor only routes
router.get('/transactions/pending', requireAdminOrEditor, StoreController.getPendingTransactions);
router.put('/transactions/:id', requireAdminOrEditor, StoreController.updateTransaction);

// Admin only routes
router.post('/items', requireAdminOrEditor, StoreController.createStoreItem);
router.put('/items/:id', requireAdminOrEditor, StoreController.updateStoreItem);
router.delete('/items/:id', requireAdmin, StoreController.deleteStoreItem);

export default router;
