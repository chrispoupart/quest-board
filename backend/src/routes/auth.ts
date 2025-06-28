import { Router } from 'express';
import { googleLogin, googleCallback } from '../controllers/authController';

const router = Router();

// Google OAuth2 login
router.get('/google/login', googleLogin);
router.get('/google/callback', (req, res, next) => {
  googleCallback(req, res).catch(next);
});

// Other routes like refreshToken and logout can be added back here if needed.

export default router;
