const request = require('supertest');

// Mock mongoose to prevent actual MongoDB connections in tests
jest.mock('mongoose', () => ({
  connect: jest.fn().mockRejectedValue(new Error('Mock connection failed')),
  connection: {
    on: jest.fn(),
    once: jest.fn(),
    close: jest.fn()
  },
  Schema: jest.fn().mockImplementation(() => ({})),
  model: jest.fn().mockImplementation(() => ({}))
}));

const app = require('../../server');
const jwt = require('jsonwebtoken');

describe('Event API', () => {
  let mockToken;
  let mockEvent;
  
  beforeAll(() => {
    // Create a mock JWT token for testing
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      role: 'user'
    };
    
    mockToken = jwt.sign(mockUser, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h'
    });
    
    // Setup mock event data
    mockEvent = {
      title: 'Integration Test Event',
      description: 'Event created during integration test',
      startTime: new Date().toISOString(),
      endTime: new Date(new Date().getTime() + 3600000).toISOString(), // 1 hour later
      category: 'personal',
      priority: 'medium'
    };
  });
  
  describe('POST /api/events', () => {
    it('should create a new event when authenticated', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(mockEvent)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.event).toBeDefined();
      expect(response.body.data.event.title).toBe(mockEvent.title);
    });
    
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/events')
        .send(mockEvent)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/events', () => {
    it('should get all events for the authenticated user', async () => {
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.events)).toBe(true);
    });
    
    it('should filter events by date range', async () => {
      const today = new Date().toISOString().split('T')[0]; // Just the date part
      
      const response = await request(app)
        .get(`/api/events?startDate=${today}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.events)).toBe(true);
    });
  });
  
  describe('GET /api/events/today', () => {
    it('should get events for the current day', async () => {
      const response = await request(app)
        .get('/api/events/today')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.events)).toBe(true);
    });
  });
  
  // Add tests for other endpoints as needed
});