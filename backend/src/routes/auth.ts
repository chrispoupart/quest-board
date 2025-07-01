import { Router } from 'express';
import { googleLogin, googleCallback, googleAuth, refreshTokenHandler, logout } from '../controllers/authController';
import { authMiddleware, isEditorOrAdmin } from '../middleware/authMiddleware';

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
router.post('/logout', authMiddleware, logout);

// Example of a protected route
router.get('/protected', authMiddleware, (req, res) => {
    res.json({ success: true, message: 'Welcome to the protected route!', user: req.user });
});

// Example of a role-protected route (only accessible by EDITOR or ADMIN)
router.get('/editor-only', authMiddleware, isEditorOrAdmin, (req, res) => {
    res.json({ success: true, message: 'Welcome, editor/admin!' });
});

export default router;
