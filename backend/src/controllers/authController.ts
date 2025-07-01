import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../db';
import { AuthService } from '../services/authService';
import { getLevel } from '../utils/leveling';

const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'];
const GOOGLE_CALLBACK_URL = process.env['GOOGLE_CALLBACK_URL'] || 'http://localhost:8000/auth/google/callback';
const FRONTEND_URL = process.env['FRONTEND_URL'] || 'http://localhost:3000';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth client ID or secret is not defined in environment variables.');
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

export const googleLogin = (req: Request, res: Response) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile'],
    prompt: 'consent',
    redirect_uri: GOOGLE_CALLBACK_URL,
  });
  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response): Promise<Response | void> => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }

  try {
    const { tokens } = await googleClient.getToken({
      code: code as string,
      redirect_uri: GOOGLE_CALLBACK_URL,
    });

    if (!tokens.id_token) {
        return res.status(400).send('ID token is missing from Google response');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      return res.status(400).send('Failed to retrieve user profile from Google');
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          googleId: payload.sub,
          role: 'PLAYER'
        },
      });
    }

    const { level, progress } = getLevel(user.experience);

    // Construct the AuthUser object expected by the token generator
    const authUser = {
      ...user,
      level,
      role: user.role as import('../types').UserRole,
      characterName: user.characterName ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      characterClass: user.characterClass ?? undefined,
      characterBio: user.characterBio ?? undefined,
      preferredPronouns: user.preferredPronouns ?? undefined,
      favoriteColor: user.favoriteColor ?? undefined,
    };

    const { accessToken, refreshToken } = AuthService.generateTokens(authUser);

    // Pass both tokens to the frontend.
    // The frontend will need to be updated to handle both.
    // Storing refreshToken in a query parameter is not ideal for production,
    // but aligns with current token passing.
    // A more secure method (e.g., HttpOnly cookie for refreshToken) is recommended for future enhancement.
    const redirectUrl = `${FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&level=${level}&progress=${progress}&name=${encodeURIComponent(user.name)}`;
    console.log('AuthController: Redirecting to:', redirectUrl);

    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).send('Authentication failed');
  }
};

export const refreshTokenHandler = async (req: Request, res: Response): Promise<Response> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, error: { message: 'Refresh token is required' } });
  }

  try {
    const { accessToken: newAccessToken } = await AuthService.refreshToken(refreshToken);
    return res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (error) {
    // Only log in non-test environments to reduce noise during testing
    if (process.env['NODE_ENV'] !== 'test') {
      console.error('Refresh token error:', error);
    }
    // Differentiate between invalid token and other errors if needed
    if (error instanceof Error && error.message.includes('Invalid token') ) {
        return res.status(401).json({ success: false, error: { message: 'Invalid or expired refresh token' } });
    }
    if (error instanceof Error && error.message.includes('User not found') ) {
      return res.status(401).json({ success: false, error: { message: 'User not found for refresh token' } });
    }
    return res.status(500).json({ success: false, error: { message: 'Failed to refresh token' } });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<Response> => {
  const { code, redirectUri } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: { message: 'Authorization code is required' }
    });
  }

  if (!redirectUri) {
    return res.status(400).json({
      success: false,
      error: { message: 'Redirect URI is required' }
    });
  }

  try {
    const { tokens } = await googleClient.getToken({
      code: code as string,
      redirect_uri: redirectUri,
    });

    if (!tokens.id_token) {
      return res.status(400).json({
        success: false,
        error: { message: 'ID token is missing from Google response' }
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Failed to retrieve user profile from Google' }
      });
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          googleId: payload.sub,
          role: 'PLAYER'
        },
      });
    }

    const { level } = getLevel(user.experience);

    // Construct the AuthUser object expected by the token generator
    const authUser = {
      ...user,
      level,
      role: user.role as import('../types').UserRole,
      characterName: user.characterName ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      characterClass: user.characterClass ?? undefined,
      characterBio: user.characterBio ?? undefined,
      preferredPronouns: user.preferredPronouns ?? undefined,
      favoriteColor: user.favoriteColor ?? undefined,
    };

    const { accessToken, refreshToken } = AuthService.generateTokens(authUser);

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          level
        }
      }
    });

  } catch (error) {
    // Only log in non-test environments to reduce noise during testing
    if (process.env['NODE_ENV'] !== 'test') {
      console.error('Authentication error:', error);
    }
    return res.status(500).json({
      success: false,
      error: { message: 'Authentication failed' }
    });
  }
};

export const logout = (req: Request, res: Response) => {
    // In a real-world scenario, you might add the token to a blacklist
    // until it expires. For now, we'll just send a success message.
    res.json({ success: true, message: 'Logged out successfully' });
};
