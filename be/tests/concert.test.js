import request from 'supertest';
import app from '../src/app.js';
import Concert from '../src/models/Concert.js';
import User from '../src/models/User.js';

describe('Concert API', () => {
  let concertId;
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      email: 'admin@test.com',
      passwordHash: 'hash',
      fullName: 'Admin User',
      role: 'ADMIN'
    });
    userId = user._id;

    const concert = await Concert.create({
      name: 'Blackpink World Tour',
      description: 'The biggest girl group world tour',
      venue: 'My Dinh Stadium',
      eventDate: new Date('2026-12-01'),
      saleStartDate: new Date('2026-01-01'),
      saleEndDate: new Date('2026-01-10'),
      status: 'ACTIVE',
      createdBy: userId,
    });
    concertId = concert._id.toString();
  });

  describe('GET /api/concerts', () => {
    it('should list all active concerts', async () => {
      const res = await request(app).get('/api/concerts');
      expect(res.status).toBe(200);
      expect(res.body.concerts).toHaveLength(1);
      expect(res.body.concerts[0].name).toBe('Blackpink World Tour');
    });

    it('should filter concerts by query', async () => {
      const res = await request(app).get('/api/concerts?q=Blackpink');
      expect(res.body.concerts).toHaveLength(1);

      const resEmpty = await request(app).get('/api/concerts?q=Unknown');
      expect(resEmpty.body.concerts).toHaveLength(0);
    });
  });

  describe('GET /api/concerts/:id', () => {
    it('should get concert details by id', async () => {
      const res = await request(app).get(`/api/concerts/${concertId}`);
      expect(res.status).toBe(200);
      expect(res.body.concert.name).toBe('Blackpink World Tour');
    });

    it('should return 404 for non-existent concert', async () => {
      const res = await request(app).get('/api/concerts/60d5ecb8b39169a53d312345');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/concerts/filters', () => {
    it('should return unique venues and months', async () => {
      const res = await request(app).get('/api/concerts/filters');
      expect(res.status).toBe(200);
      expect(res.body.venues).toContain('My Dinh Stadium');
      expect(res.body.months).toContain('2026-12');
    });
  });
});
