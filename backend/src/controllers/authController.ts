import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET']
);

// JWT configuration
const JWT_SECRET = process.env['JWT_SECRET'] || 'dev-secret-key';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '30m';

interface GoogleUserInfo {
    sub: string; // Google ID
    email: string;
    name: string;
    picture?: string;
}

interface JWTPayload {
    userId: number;
    email: string;
    role: string;
}

export const authController = {
    /**
     * Google OAuth2 login
     */
    async googleLogin(req: Request, res: Response): Promise<void> {
        try {
            const { code, redirectUri } = req.body;

            if (!code || !redirectUri) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Code and redirectUri are required',
                    },
                });
                return;
            }

            // Exchange authorization code for tokens
            const { tokens } = await googleClient.getToken({
                code,
                redirect_uri: redirectUri,
            });

            if (!tokens.id_token) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Failed to get ID token from Google',
                    },
                });
                return;
            }

            // Verify the ID token
            const ticket = await googleClient.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env['GOOGLE_CLIENT_ID']!,
            });

            const payload = ticket.getPayload() as GoogleUserInfo;

            if (!payload) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Invalid ID token payload',
                    },
                });
                return;
            }

            // Find or create user
            let user = await prisma.user.findUnique({
                where: { googleId: payload.sub },
            });

            if (!user) {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        googleId: payload.sub,
                        email: payload.email,
                        name: payload.name,
                        role: 'PLAYER', // Default role
                        bountyBalance: 0,
                    },
                });
            } else {
                // Update existing user's info
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        email: payload.email,
                        name: payload.name,
                    },
                });
            }

            // Generate JWT tokens
            const accessToken = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                } as JWTPayload,
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN } as SignOptions
            );

            const refreshToken = jwt.sign(
                {
                    userId: user.id,
                    type: 'refresh',
                },
                JWT_SECRET,
                { expiresIn: '7d' } as SignOptions
            );

            // For now, we'll store refresh tokens in memory or use a simple approach
            // In production, you'd want to store them in the database
            // TODO: Add RefreshToken model to Prisma schema

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        googleId: user.googleId,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        bountyBalance: user.bountyBalance,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    },
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            console.error('Google login error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Authentication failed',
                    details: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        }
    },

    /**
     * Refresh access token
     */
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Refresh token is required',
                    },
                });
                return;
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, JWT_SECRET as jwt.Secret) as any;

            if (decoded.type !== 'refresh') {
                res.status(401).json({
                    success: false,
                    error: {
                        message: 'Invalid refresh token',
                    },
                });
                return;
            }

            // Get user from database
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });

            if (!user) {
                res.status(401).json({
                    success: false,
                    error: {
                        message: 'User not found',
                    },
                });
                return;
            }

            // Generate new access token
            const accessToken = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                } as JWTPayload,
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN } as SignOptions
            );

            res.json({
                success: true,
                data: {
                    accessToken,
                    user: {
                        id: user.id,
                        googleId: user.googleId,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        bountyBalance: user.bountyBalance,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    },
                },
            });
        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json({
                success: false,
                error: {
                    message: 'Token refresh failed',
                    details: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        }
    },

    /**
     * Logout user
     */
    async logout(req: Request, res: Response): Promise<void> {
        try {
            // For now, we'll just return success
            // In production, you'd want to invalidate the refresh token
            res.json({
                success: true,
                data: {
                    message: 'Logged out successfully',
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Logout failed',
                    details: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        }
    },
};
