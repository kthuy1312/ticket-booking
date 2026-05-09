import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';

describe('Auth API', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Password123',
    fullName: 'Test User',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should not register user with existing email', async () => {
      await User.create({
        email: testUser.email,
        passwordHash: 'hashed',
        fullName: testUser.fullName,
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email đã được đăng ký');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'only@email.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
    });
  });
});
