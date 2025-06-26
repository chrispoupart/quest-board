import { Router } from 'express';

const router = Router();

// TODO: Implement dashboard routes
router.get('/', (req, res) => {
  res.json({ message: 'Dashboard data endpoint' });
});

router.get('/stats', (req, res) => {
  res.json({ message: 'User statistics endpoint' });
});

export default router;
