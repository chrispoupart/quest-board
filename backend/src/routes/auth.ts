import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// Google OAuth2 login
router.post('/google', authController.googleLogin);

// Refresh access token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

export default router;
