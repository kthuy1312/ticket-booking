import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// Mock Redis
jest.unstable_mockModule('../src/libs/redis.js', () => ({
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
  acquireLock: jest.fn().mockResolvedValue(true),
  releaseLock: jest.fn().mockResolvedValue(true),
}));

let mongoServer;

beforeAll(async () => {
  console.log('Starting MongoMemoryReplSet...');
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' }
  });
  const uri = mongoServer.getUri();
  console.log('Connecting to MongoMemoryReplSet at:', uri);
  await mongoose.connect(uri);
  console.log('Connected to database.');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});
