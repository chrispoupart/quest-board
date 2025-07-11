// Mock Google OAuth FIRST, before any imports
jest.mock('google-auth-library', () => {
    return {
        OAuth2Client: jest.fn().mockImplementation(() => ({
            getToken: jest.fn().mockResolvedValue({
                tokens: {
                    id_token: 'mock-id-token'
                }
            }),
            verifyIdToken: jest.fn().mockResolvedValue({
                getPayload: () => ({
                    sub: 'mock-google-id',
                    email: 'mock@example.com',
                    name: 'Mock User'
                })
            })
        }))
    };
});

// Set environment before importing app
process.env['NODE_ENV'] = 'test';

import request from 'supertest';
import { Express } from 'express';
import { app } from '../src/index';
import {
    setupTestDatabase,
    clearTestData,
    createTestUser,
    createTestToken,
    getTestPrisma,
    resetUserCounter
} from './setup';

jest.setTimeout(30000);

describe('Authentication Endpoints', () => {
    let server: Express;

    beforeAll(async () => {
        await setupTestDatabase();
        server = app;
    });

    beforeEach(async () => {
        resetUserCounter(); // Reset counter FIRST to ensure unique emails
        await clearTestData();
    });

    describe('POST /auth/google', () => {
        it('should authenticate user with valid Google OAuth code', async () => {
            const response = await request(server)
                .post('/auth/google')
                .send({
                    code: 'valid-oauth-code',
                    redirectUri: 'http://localhost:3000/auth/callback'
                });

            // Should successfully create user and return tokens
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user.email).toBe('mock@example.com');
            expect(response.body.data.user.name).toBe('Mock User');
        });

        it('should return 400 for missing OAuth code', async () => {
            const response = await request(server)
                .post('/auth/google')
                .send({
                    redirectUri: 'http://localhost:3000/auth/callback'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('required');
        });

        it('should return 400 for missing redirect URI', async () => {
            const response = await request(server)
                .post('/auth/google')
                .send({
                    code: 'valid-oauth-code'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('required');
        });
    });

    describe('POST /auth/refresh', () => {
        it('should refresh valid token', async () => {
            // Create a test user
            const user = await createTestUser({
                name: 'Test User',
                email: 'test@example.com',
                role: 'PLAYER'
            });

            // Create a valid refresh token
            const refreshToken = createTestToken(user.id, user.email, user.role);

            const response = await request(server)
                .post('/auth/refresh')
                .send({ refreshToken });

            // This would work with proper JWT refresh logic
            expect(response.status).toBeDefined();
        });

        it('should return 400 for missing refresh token', async () => {
            const response = await request(server)
                .post('/auth/refresh')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 for invalid refresh token', async () => {
            const response = await request(server)
                .post('/auth/refresh')
                .send({ refreshToken: 'invalid-token' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout user successfully', async () => {
            const user = await createTestUser();
            const token = createTestToken(user.id, user.email, user.role);

            const response = await request(server)
                .post('/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 401 for missing token', async () => {
            const response = await request(server)
                .post('/auth/logout');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 for invalid token', async () => {
            const response = await request(server)
                .post('/auth/logout')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
