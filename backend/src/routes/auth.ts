import { Router } from 'express';

const router = Router();

// TODO: Implement authentication routes
router.post('/google', (req, res) => {
  res.json({ message: 'Google OAuth2 login endpoint' });
});

router.post('/refresh', (req, res) => {
  res.json({ message: 'Token refresh endpoint' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint' });
});

export default router;
