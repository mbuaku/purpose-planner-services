const request = require('supertest');
const app = require('../../server');
const jwt = require('jsonwebtoken');

describe('Dashboard API', () => {
  let mockToken;
  
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
  });
  
  describe('GET /api/dashboard', () => {
    it('should get or create a user dashboard when authenticated', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.dashboard).toBeDefined();
      expect(Array.isArray(response.body.data.dashboard.widgets)).toBe(true);
    });
    
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/dashboard', () => {
    it('should create or update a dashboard when authenticated', async () => {
      const dashboardData = {
        name: 'Test Dashboard',
        widgets: [
          {
            type: 'spiritual-summary',
            title: 'Spiritual Overview',
            source: 'spiritual-service',
            position: 'top-left'
          },
          {
            type: 'upcoming-events',
            title: 'Events',
            source: 'schedule-service',
            position: 'top-right'
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/dashboard')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(dashboardData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.dashboard).toBeDefined();
      expect(response.body.data.dashboard.name).toBe('Test Dashboard');
      expect(response.body.data.dashboard.widgets).toHaveLength(2);
    });
  });
  
  describe('GET /api/dashboard/widget/:id', () => {
    it('should get widget data when authenticated', async () => {
      // First, get the dashboard to obtain a valid widget ID
      const dashboardResponse = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      
      const widgetId = dashboardResponse.body.data.dashboard.widgets[0]._id;
      
      const response = await request(app)
        .get(`/api/dashboard/widget/${widgetId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.widget).toBeDefined();
      expect(response.body.data.widgetData).toBeDefined();
    });
  });
  
  describe('POST /api/dashboard/refresh', () => {
    it('should refresh all widgets when authenticated', async () => {
      const response = await request(app)
        .post('/api/dashboard/refresh')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.results)).toBe(true);
    });
  });
  
  // Add tests for other endpoints as needed
});