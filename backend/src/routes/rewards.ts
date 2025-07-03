import { Router } from 'express';
import { RewardsController } from '../controllers/rewardsController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// All rewards routes require authentication
router.use(authMiddleware);

// GET /rewards/config - get current reward config (admin only for now, can be relaxed later)
router.get('/config', isAdmin, RewardsController.getConfig);

// POST /rewards/config - update reward config (admin only)
router.post('/config', isAdmin, RewardsController.updateConfig);

// GET /rewards/collective-progress - get collective reward progress for the quarter (any authenticated user)
router.get('/collective-progress', RewardsController.getCollectiveProgress);

export default router;
