import { Router } from 'express';
import { googleLogin, googleCallback, refreshTokenHandler } from '../controllers/authController';

const router = Router();

// Google OAuth2 login
router.get('/google/login', googleLogin);
router.get('/google/callback', (req, res, next) => {
  googleCallback(req, res).catch(next);
});

// Refresh token route
router.post('/refresh', (req, res, next) => {
  refreshTokenHandler(req, res).catch(next);
});


export default router;
