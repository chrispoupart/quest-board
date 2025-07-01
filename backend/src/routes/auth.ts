import { Router } from 'express';
import { googleLogin, googleCallback, googleAuth, refreshTokenHandler } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Google OAuth2 login
router.get('/google/login', googleLogin);
router.post('/google', (req, res, next) => {
  // Handle POST /auth/google for tests
  googleAuth(req, res).catch(next);
});
router.get('/google/callback', (req, res, next) => {
  googleCallback(req, res).catch(next);
});

// Refresh token route
router.post('/refresh', (req, res, next) => {
  refreshTokenHandler(req, res).catch(next);
});

// Logout route
router.post('/logout', authenticateToken, (req, res) => {
  // For now, just return success - in a real app you'd invalidate the token
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
