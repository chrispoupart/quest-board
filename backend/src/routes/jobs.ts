import { Router } from 'express';
import { JobController } from '../controllers/jobController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all job routes
router.use(authenticateToken);

// All job routes require admin access
router.use(requireAdmin);

// Job management routes
router.get('/', JobController.getAllJobStatuses);
router.get('/health', JobController.getSystemHealth);
router.get('/:name', JobController.getJobStatus);
router.post('/:name/trigger', JobController.triggerJob);
router.delete('/:name', JobController.stopJob);

export default router;
