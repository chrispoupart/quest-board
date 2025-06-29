import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../index';
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

    const token = AuthService.generateToken(authUser);

    const redirectUrl = `${FRONTEND_URL}/auth/callback?token=${token}&level=${level}&progress=${progress}&name=${encodeURIComponent(user.name)}`;
    console.log('AuthController: Redirecting to:', redirectUrl);

    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).send('Authentication failed');
  }
};
