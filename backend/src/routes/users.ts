import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { validateUserUpdate, validateUserId, validateRoleUpdate } from '../middleware/validationMiddleware';

const router = Router();

// Apply authentication middleware to all user routes
router.use(authenticateToken);

// Get current user profile
router.get('/me', UserController.getCurrentUser);

// Update current user profile
router.put('/me', validateUserUpdate, UserController.updateCurrentUser);

// Get user statistics
router.get('/me/stats', UserController.getUserStats);

// Admin-only routes
router.get('/', requireAdmin, UserController.getAllUsers);
router.get('/:id', requireAdmin, validateUserId, UserController.getUserById);
router.put('/:id/role', requireAdmin, validateUserId, validateRoleUpdate, UserController.updateUserRole);

export default router;
