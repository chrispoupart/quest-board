import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { validatePagination } from '../middleware/validationMiddleware';

const router = Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticateToken);

// User dashboard routes
router.get('/', DashboardController.getUserDashboard);
router.get('/stats', DashboardController.getUserStats);
router.get('/quests', validatePagination, DashboardController.getQuestListing);
router.get('/recent-activity', DashboardController.getRecentActivity);
router.get('/active-quests', DashboardController.getActiveQuests);

// Admin dashboard routes
router.get('/admin', requireAdmin, DashboardController.getAdminDashboard);

export default router;
