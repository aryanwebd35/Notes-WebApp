import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Auth Integration Tests
 * 
 * Tests the complete authentication flow:
 * - User registration
 * - Login
 * - Token generation
 * - Protected routes
 */

describe('Auth API', () => {
    beforeAll(async () => {
        // Connect to test database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/notes-test');
        }
    });

    afterAll(async () => {
        // Clean up
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body.email).toBe('test@example.com');
        });

        it('should not register user with existing email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User 2',
                    email: 'test@example.com', // Same email
                    password: 'password123',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('already exists');
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    // Missing email and password
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('refreshToken');
        });

        it('should not login with invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(res.statusCode).toBe(401);
        });

        it('should not login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        let token;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });
            token = res.body.token;
        });

        it('should get current user with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe('test@example.com');
        });

        it('should not get user without token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.statusCode).toBe(401);
        });

        it('should not get user with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalidtoken');

            expect(res.statusCode).toBe(401);
        });
    });
});
