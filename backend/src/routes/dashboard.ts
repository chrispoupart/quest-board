import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';
import { validatePagination } from '../middleware/validationMiddleware';

const router = Router();

// Apply authentication middleware to all dashboard routes
router.use(authMiddleware);

// User dashboard routes
router.get('/', DashboardController.getUserDashboard);
router.get('/stats', DashboardController.getUserStats);
router.get('/quests', validatePagination, DashboardController.getQuestListing);
router.get('/recent-activity', DashboardController.getRecentActivity);
router.get('/active-quests', DashboardController.getActiveQuests);

// Admin dashboard routes
router.get('/admin', isAdmin, DashboardController.getAdminDashboard);

// New leaderboard endpoint
router.get('/leaderboard/bounty', DashboardController.getBountyLeaderboard);

export default router;
