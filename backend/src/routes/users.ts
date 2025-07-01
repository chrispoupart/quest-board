import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';
import { validateUserUpdate, validateUserId, validateRoleUpdate } from '../middleware/validationMiddleware';

const router = Router();

// All user routes are protected
router.use(authMiddleware);

// Get current user profile (alternative endpoint for tests)
router.get('/profile', UserController.getCurrentUser);

// Get current user profile
router.get('/me', UserController.getCurrentUser);

// Update current user profile
router.put('/me', validateUserUpdate, UserController.updateCurrentUser);

// Get user statistics
router.get('/me/stats', UserController.getUserStats);

// GET all users (admin only)
router.get('/', isAdmin, UserController.getAllUsers);
router.get('/:id', isAdmin, validateUserId, UserController.getUserById);
router.get('/:id/stats', validateUserId, UserController.getUserStatsById);
router.put('/:id/role', isAdmin, validateUserId, validateRoleUpdate, UserController.updateUserRole);

export default router;
