import request from 'supertest';
import app from '../src/index';
import {
    setupTestDatabase,
    teardownTestDatabase,
    clearTestData,
    createTestUser,
    createTestToken,
    getTestPrisma
} from './setup';

describe('User Endpoints', () => {
    beforeAll(async () => {
        process.env['NODE_ENV'] = 'test';
        await setupTestDatabase();
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    beforeEach(async () => {
        await clearTestData();
    });

    describe('GET /users/profile', () => {
        it('should return authenticated user profile', async () => {
            const user = await createTestUser({
                name: 'John Doe',
                email: 'john@example.com',
                role: 'PLAYER',
                bountyBalance: 150
            });

            const token = createTestToken(user.id, user.email, user.role);

            const response = await request(app)
                .get('/users/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.id).toBe(user.id);
            expect(response.body.data.user.email).toBe(user.email);
            expect(response.body.data.user.bountyBalance).toBe(150);
            // Should not include sensitive data
            expect(response.body.data.user.googleId).toBeUndefined();
        });

        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(app).get('/users/profile');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 403 for invalid token', async () => {
            const response = await request(app)
                .get('/users/profile')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /users', () => {
        it('should return all users for admin', async () => {
            const admin = await createTestUser({
                role: 'ADMIN',
                email: 'admin@test.com'
            });
            const user1 = await createTestUser({
                role: 'PLAYER',
                email: 'player1@test.com'
            });
            const user2 = await createTestUser({
                role: 'EDITOR',
                email: 'editor@test.com'
            });

            const token = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.users).toHaveLength(3);
        });

        it('should return 403 for non-admin users', async () => {
            const player = await createTestUser({ role: 'PLAYER' });
            const token = createTestToken(player.id, player.email, player.role);

            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /users/:id/role', () => {
        it('should allow admin to change user role', async () => {
            const admin = await createTestUser({
                role: 'ADMIN',
                email: 'admin@test.com'
            });
            const player = await createTestUser({
                role: 'PLAYER',
                email: 'player@test.com'
            });

            const token = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put(`/users/${player.id}/role`)
                .set('Authorization', `Bearer ${token}`)
                .send({ role: 'EDITOR' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.role).toBe('EDITOR');
        });

        it('should return 403 for non-admin users', async () => {
            const editor = await createTestUser({
                role: 'EDITOR',
                email: 'editor@test.com'
            });
            const player = await createTestUser({
                role: 'PLAYER',
                email: 'player@test.com'
            });

            const token = createTestToken(editor.id, editor.email, editor.role);

            const response = await request(app)
                .put(`/users/${player.id}/role`)
                .set('Authorization', `Bearer ${token}`)
                .send({ role: 'ADMIN' });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid role', async () => {
            const admin = await createTestUser({ role: 'ADMIN' });
            const player = await createTestUser({
                role: 'PLAYER',
                email: 'player@test.com'
            });

            const token = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put(`/users/${player.id}/role`)
                .set('Authorization', `Bearer ${token}`)
                .send({ role: 'INVALID_ROLE' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 404 for non-existent user', async () => {
            const admin = await createTestUser({ role: 'ADMIN' });
            const token = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put('/users/99999/role')
                .set('Authorization', `Bearer ${token}`)
                .send({ role: 'EDITOR' });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /users/:id/stats', () => {
        it('should return user statistics', async () => {
            const user = await createTestUser({
                role: 'PLAYER',
                bountyBalance: 500
            });

            const token = createTestToken(user.id, user.email, user.role);

            const response = await request(app)
                .get(`/users/${user.id}/stats`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.stats).toBeDefined();
            expect(response.body.data.stats.bountyBalance).toBe(500);
            expect(typeof response.body.data.stats.questsCompleted).toBe('number');
            expect(typeof response.body.data.stats.questsClaimed).toBe('number');
            expect(typeof response.body.data.stats.questsCreated).toBe('number');
        });

        it('should return 404 for non-existent user', async () => {
            const user = await createTestUser({ role: 'PLAYER' });
            const token = createTestToken(user.id, user.email, user.role);

            const response = await request(app)
                .get('/users/99999/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});
