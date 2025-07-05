import { Router } from 'express';
import { JobController } from '../controllers/jobController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// All job routes are protected and require admin privileges
router.use(authMiddleware);
router.use(isAdmin);

// Job management routes
/**
 * @openapi
 * /jobs:
 *   get:
 *     summary: Get all jobs (admin only)
 *     tags:
 *       - Jobs
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/', JobController.getAllJobStatuses);
router.get('/health', JobController.getSystemHealth);
router.get('/:name', JobController.getJobStatus);
router.post('/:name/trigger', JobController.triggerJob);
router.delete('/:name', JobController.stopJob);

export default router;
