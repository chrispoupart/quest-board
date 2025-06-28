import { OAuth2Client } from 'google-auth-library';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { UserRole, JwtPayload, GoogleUserInfo, AuthUser } from '../types';
import { calculateLevel } from '../utils/leveling';
import { User } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET']
);

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-default-secret-key';

export class AuthService {
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
            console.error('Google authentication error:', error);
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
    static generateToken(user: AuthUser): string {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const secret = process.env['JWT_SECRET'];
        if (!secret) {
            throw new Error('JWT secret not configured');
        }

        return jwt.sign(payload, secret, { expiresIn: '30m' });
    }

    /**
     * Verify JWT token
     */
    static verifyToken(token: string): JwtPayload {
        try {
            const secret = process.env['JWT_SECRET'];
            if (!secret) {
                throw new Error('JWT secret not configured');
            }

            const decoded = jwt.verify(token, secret) as JwtPayload;
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    /**
     * Refresh JWT token
     */
    static async refreshToken(refreshToken: string): Promise<string> {
        try {
            // Verify the refresh token
            const decoded = this.verifyToken(refreshToken);

            // Get current user data
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Generate new token
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

            return this.generateToken(authUser);
        } catch (error) {
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

export const generateToken = (user: AuthUser): string => {
    return AuthService.generateToken(user);
};
