import { Router } from 'express';

const router = Router();

// TODO: Implement user routes
router.get('/me', (req, res) => {
  res.json({ message: 'Get current user endpoint' });
});

router.put('/me', (req, res) => {
  res.json({ message: 'Update user endpoint' });
});

router.get('/', (req, res) => {
  res.json({ message: 'List users endpoint' });
});

export default router;
