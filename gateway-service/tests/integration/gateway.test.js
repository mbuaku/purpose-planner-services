// Set NODE_ENV and JWT_SECRET before importing modules
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock helmet to avoid issues in test environment
jest.mock('helmet', () => {
  return jest.fn().mockImplementation(() => (req, res, next) => next());
});

// Mock morgan to avoid logging in tests
jest.mock('morgan', () => {
  return jest.fn().mockImplementation(() => (req, res, next) => next());
});

// Mock services for integration tests
jest.mock('http-proxy-middleware', () => {
  const { createProxyMiddleware } = jest.requireActual('http-proxy-middleware');
  
  // Return a mock implementation that doesn't actually proxy requests
  return {
    createProxyMiddleware: jest.fn().mockImplementation((options) => {
      return (req, res, next) => {
        // Add metadata about the proxy for testing
        req.proxyOptions = options;
        
        // Mock successful proxy response for testing
        if (req.path.includes('/health')) {
          return res.status(200).json({
            success: true,
            message: 'Service is healthy',
            service: options.target
          });
        }
        
        // For auth-specific endpoints
        if (req.path === '/profile' || req.path.includes('/auth/profile')) {
          // Mock auth service response - auth service would validate the token
          // For testing purposes, we'll assume the token is valid if it exists
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            return res.status(200).json({
              success: true,
              data: {
                id: 'user123',
                email: 'test@example.com',
                role: 'user',
                firstName: 'Test',
                lastName: 'User'
              }
            });
          } else {
            return res.status(401).json({
              success: false,
              message: 'Authentication required'
            });
          }
        }
        
        // For other endpoints, return a default mock response
        res.status(200).json({
          success: true,
          message: 'Mocked service response',
          service: options.target,
          path: req.path
        });
      };
    })
  };
});

const app = require('../../server');

describe('API Gateway', () => {
  let mockToken;
  
  beforeAll(() => {
    // Create a mock JWT token for testing
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      role: 'user'
    };
    
    // Use a test secret
    process.env.JWT_SECRET = 'test-secret';
    
    mockToken = jwt.sign(mockUser, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
  });
  
  describe('Health Check', () => {
    it('should return 200 for health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('healthy');
    });
  });
  
  describe('Authentication', () => {
    it('should return 401 for protected routes without token', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Authentication required');
    });
    
    it('should allow access to protected routes with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      
      // Debug the response
      if (!response.body.data) {
        console.log('Response body:', JSON.stringify(response.body, null, 2));
      }
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe('user123');
    });
  });
  
  describe('Routing', () => {
    it('should route auth requests to auth service', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
    
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Endpoint not found');
    });
  });
  
  // Add other integration tests as needed
  
  afterAll(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });
});