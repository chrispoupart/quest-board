import { OAuth2Client } from 'google-auth-library';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole, JwtPayload, GoogleUserInfo, AuthUser } from '../types';
import { calculateLevel } from '../utils/leveling';
import { prisma } from '../db';

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET']
);

const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required but not set');
}

export class AuthService {
    /**
     * Get and validate refresh token secret
     */
    private static getRefreshTokenSecret(): string {
        // Get refresh token secret with proper validation
        let secret = process.env['JWT_REFRESH_SECRET'];

        // If no dedicated refresh secret, derive from JWT_SECRET but validate it's not undefined
        if (!secret) {
            const baseSecret = process.env['JWT_SECRET'];
            if (!baseSecret) {
                throw new Error('JWT_SECRET not configured - cannot use refresh tokens');
            }
            secret = baseSecret + '_refresh';
        }

        // Validate that the secret is not weak or predictable
        if (!secret || secret === 'undefined_refresh' || secret.length < 32) {
            throw new Error('JWT refresh secret is weak or not properly configured (minimum 32 characters required)');
        }

        return secret;
    }

    /**
     * Authenticate user with Google OAuth2
     */
    static async authenticateWithGoogle(code: string, redirectUri: string): Promise<AuthUser> {
        try {
            // Exchange authorization code for tokens
            const { tokens } = await googleClient.getToken({
                code,
                redirect_uri: redirectUri,
            });

            if (!tokens.id_token) {
                throw new Error('No ID token received from Google');
            }

            // Verify the ID token
            const audience = process.env['GOOGLE_CLIENT_ID'];
            if (!audience) {
                throw new Error('Google Client ID not configured');
            }

            const ticket = await googleClient.verifyIdToken({
                idToken: tokens.id_token,
                audience,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Invalid ID token payload');
            }

            const googleUserInfo: GoogleUserInfo = {
                id: payload.sub!,
                email: payload.email!,
                name: payload.name!,
                picture: payload.picture || undefined,
            };

            // Find or create user
            const user = await this.findOrCreateUser(googleUserInfo);

            return {
                id: user.id,
                googleId: user.googleId,
                name: user.name,
                email: user.email,
                role: user.role as UserRole,
                bountyBalance: user.bountyBalance,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                characterName: user.characterName ?? undefined,
                avatarUrl: user.avatarUrl ?? undefined,
                characterClass: user.characterClass ?? undefined,
                characterBio: user.characterBio ?? undefined,
                preferredPronouns: user.preferredPronouns ?? undefined,
                favoriteColor: user.favoriteColor ?? undefined,
                experience: user.experience,
                level: calculateLevel(user.experience)
            };
        } catch (error) {
            // Only log in non-test environments to reduce noise during testing
            if (process.env['NODE_ENV'] !== 'test') {
                console.error('Google authentication error:', error);
            }
            throw new Error('Authentication failed');
        }
    }

    /**
     * Find existing user or create new one
     */
    private static async findOrCreateUser(googleUserInfo: GoogleUserInfo) {
        // Try to find user by Google ID first
        let user = await prisma.user.findUnique({
            where: { googleId: googleUserInfo.id },
        });

        if (!user) {
            // Try to find user by email
            user = await prisma.user.findUnique({
                where: { email: googleUserInfo.email },
            });

            if (user) {
                // Update existing user with Google ID
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: googleUserInfo.id },
                });
            } else {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        googleId: googleUserInfo.id,
                        name: googleUserInfo.name,
                        email: googleUserInfo.email,
                        role: 'PLAYER', // Default role
                        bountyBalance: 0,
                    },
                });
            }
        }

        return user;
    }

    /**
     * Generate JWT token for user
     */
    static generateAccessToken(user: AuthUser): string {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            type: 'access', // Differentiate token type
        };

        const secret = process.env['JWT_SECRET'];
        if (!secret) {
            throw new Error('JWT secret not configured');
        }

        const expiresIn = process.env['ACCESS_TOKEN_EXPIRY_DURATION'] || '7d';
        return jwt.sign(payload, secret, { expiresIn } as SignOptions);
    }

    static generateRefreshToken(user: AuthUser): string {
        const payload = {
            userId: user.id,
            // Add a scope or type to identify it as a refresh token
            type: 'refresh',
        };

        const secret = this.getRefreshTokenSecret();

        // Longer expiry for refresh token
        return jwt.sign(payload, secret, { expiresIn: '30d' } as SignOptions);
    }

    static generateTokens(user: AuthUser): { accessToken: string; refreshToken: string } {
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        return { accessToken, refreshToken };
    }

    /**
     * Verify JWT token
     */
    static verifyToken(token: string, isRefreshToken: boolean = false): JwtPayload & { type?: string } {
        try {
            let secret;
            if (isRefreshToken) {
                secret = this.getRefreshTokenSecret();
            } else {
                secret = process.env['JWT_SECRET'];
                if (!secret) {
                    throw new Error('JWT secret not configured');
                }
            }

            const decoded = jwt.verify(token, secret) as JwtPayload & { type?: string };

            // Validate token type if present in payload
            if (isRefreshToken && decoded.type !== 'refresh') {
                throw new Error('Invalid token type: expected refresh token');
            }
            if (!isRefreshToken && decoded.type === 'refresh') { // Allow access tokens without type for backward compatibility if needed
                throw new Error('Invalid token type: expected access token');
            }

            return decoded;
        } catch (error) {
            // Only log in non-test environments to reduce noise during testing
            if (process.env['NODE_ENV'] !== 'test') {
                console.error("Token verification error:", error);
            }
            throw new Error('Invalid token');
        }
    }

    /**
     * Refresh JWT token
     */
    static async refreshToken(token: string): Promise<{accessToken: string}> {
        try {
            // Verify the refresh token
            const decoded = this.verifyToken(token, true);

            if (!decoded.userId) {
                throw new Error('Invalid refresh token payload');
            }

            // Get current user data
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });

            if (!user) {
                throw new Error('User not found for refresh token');
            }

            // Generate new access token
            const authUser: AuthUser = {
                id: user.id,
                googleId: user.googleId,
                name: user.name,
                email: user.email,
                role: user.role as UserRole,
                bountyBalance: user.bountyBalance,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                characterName: user.characterName ?? undefined,
                avatarUrl: user.avatarUrl ?? undefined,
                characterClass: user.characterClass ?? undefined,
                characterBio: user.characterBio ?? undefined,
                preferredPronouns: user.preferredPronouns ?? undefined,
                favoriteColor: user.favoriteColor ?? undefined,
                experience: user.experience,
                level: calculateLevel(user.experience)
            };

            const newAccessToken = this.generateAccessToken(authUser);
            return { accessToken: newAccessToken };
        } catch (error) {
            // Only log in non-test environments to reduce noise during testing
            if (process.env['NODE_ENV'] !== 'test') {
                console.error("Token refresh error:", error);
            }

            // Handle specific JWT errors for proper 401 responses
            if (error instanceof Error) {
                if (error.message.includes('jwt malformed') ||
                    error.message.includes('invalid token') ||
                    error.message.includes('Invalid token') ||
                    error.message.includes('Invalid refresh token payload') ||
                    error.message.includes('User not found for refresh token')) {
                    throw new Error('Invalid token');
                }
            }

            throw new Error('Token refresh failed');
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: number): Promise<AuthUser | null> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            googleId: user.googleId,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            bountyBalance: user.bountyBalance,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            characterName: user.characterName ?? undefined,
            avatarUrl: user.avatarUrl ?? undefined,
            characterClass: user.characterClass ?? undefined,
            characterBio: user.characterBio ?? undefined,
            preferredPronouns: user.preferredPronouns ?? undefined,
            favoriteColor: user.favoriteColor ?? undefined,
            experience: user.experience,
            level: calculateLevel(user.experience)
        };
    }

    /**
     * Update user role (admin only)
     */
    static async updateUserRole(userId: number, newRole: UserRole): Promise<AuthUser> {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });

        return {
            id: user.id,
            googleId: user.googleId,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            bountyBalance: user.bountyBalance,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            characterName: user.characterName ?? undefined,
            avatarUrl: user.avatarUrl ?? undefined,
            characterClass: user.characterClass ?? undefined,
            characterBio: user.characterBio ?? undefined,
            preferredPronouns: user.preferredPronouns ?? undefined,
            favoriteColor: user.favoriteColor ?? undefined,
            experience: user.experience,
            level: calculateLevel(user.experience)
        };
    }

    /**
     * Check if user has required role
     */
    static hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
        return requiredRoles.includes(userRole);
    }

    /**
     * Check if user is admin
     */
    static isAdmin(userRole: UserRole): boolean {
        return userRole === 'ADMIN';
    }

    /**
     * Check if user is editor or admin
     */
    static isEditorOrAdmin(userRole: UserRole): boolean {
        return userRole === 'EDITOR' || userRole === 'ADMIN';
    }
}

export const generateTokens = (user: AuthUser): { accessToken: string; refreshToken: string } => {
    return AuthService.generateTokens(user);
};
