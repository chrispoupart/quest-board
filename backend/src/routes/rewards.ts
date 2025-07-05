import { Router } from 'express';
import { RewardsController } from '../controllers/rewardsController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// All rewards routes require authentication
router.use(authMiddleware);

/**
 * @openapi
 * /rewards/config:
 *   get:
 *     summary: Get current reward config (admin only)
 *     tags:
 *       - Rewards
 *     responses:
 *       200:
 *         description: Reward config
 */
// GET /rewards/config - get current reward config (admin only for now, can be relaxed later)
router.get('/config', isAdmin, RewardsController.getConfig);

/**
 * @openapi
 * /rewards/config:
 *   post:
 *     summary: Update reward config (admin only)
 *     tags:
 *       - Rewards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated reward config
 */
// POST /rewards/config - update reward config (admin only)
router.post('/config', isAdmin, RewardsController.updateConfig);

// GET /rewards/collective-progress - get collective reward progress for the quarter (any authenticated user)
router.get('/collective-progress', RewardsController.getCollectiveProgress);

export default router;
