import { Router } from 'express';
import { JobController } from '../controllers/jobController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// All job routes are protected and require admin privileges
router.use(authMiddleware);
router.use(isAdmin);

// Job management routes
router.get('/', JobController.getAllJobStatuses);
router.get('/health', JobController.getSystemHealth);
router.get('/:name', JobController.getJobStatus);
router.post('/:name/trigger', JobController.triggerJob);
router.delete('/:name', JobController.stopJob);

export default router;
