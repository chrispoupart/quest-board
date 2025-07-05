import { Router } from 'express';
import { googleLogin, googleCallback, googleAuth, refreshTokenHandler, logout } from '../controllers/authController';
import { authMiddleware, isEditorOrAdmin } from '../middleware/authMiddleware';

const router = Router();

/**
 * @openapi
 * /auth/google/login:
 *   get:
 *     summary: Google OAuth2 login
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth2 login
 */
router.get('/google/login', googleLogin);
router.post('/google', (req, res, next) => {
  // Handle POST /auth/google for tests
  googleAuth(req, res).catch(next);
});
router.get('/google/callback', (req, res, next) => {
  googleCallback(req, res).catch(next);
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Refreshed token
 */
router.post('/refresh', (req, res, next) => {
  refreshTokenHandler(req, res).catch(next);
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: User logged out
 */
router.post('/logout', authMiddleware, logout);

/**
 * @openapi
 * /auth/protected:
 *   get:
 *     summary: Example protected route
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Protected route response
 */
// Example of a protected route
router.get('/protected', authMiddleware, (req, res) => {
    res.json({ success: true, message: 'Welcome to the protected route!', user: req.user });
});

/**
 * @openapi
 * /auth/editor-only:
 *   get:
 *     summary: Example editor/admin protected route
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Editor/admin protected route response
 */
// Example of a role-protected route (only accessible by EDITOR or ADMIN)
router.get('/editor-only', authMiddleware, isEditorOrAdmin, (req, res) => {
    res.json({ success: true, message: 'Welcome, editor/admin!' });
});

export default router;
