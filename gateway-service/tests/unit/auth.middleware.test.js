const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middleware/auth');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('axios');
jest.mock('../../src/config/services', () => ({
  auth: {
    url: 'http://mock-auth-service',
    timeout: 1000
  }
}));

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request, response, and next function
    req = {
      headers: {},
      logger: {
        error: jest.fn()
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });
  
  describe('verifyToken', () => {
    it('should return 401 if no token is provided', async () => {
      // Arrange
      req.headers.authorization = undefined;
      
      // Act
      await authMiddleware.verifyToken(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('No token provided')
      }));
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should call next() if token is valid', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      req.headers.authorization = `Bearer ${token}`;
      
      const decodedToken = {
        id: 'user123',
        email: 'user@example.com',
        role: 'user'
      };
      
      jwt.verify.mockReturnValue(decodedToken);
      
      // Act
      await authMiddleware.verifyToken(req, res, next);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(req.user).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
  
  describe('isAdmin', () => {
    it('should call next() if user is admin', () => {
      // Arrange
      req.user = {
        id: 'admin123',
        role: 'admin'
      };
      
      // Act
      authMiddleware.isAdmin(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user is not admin', () => {
      // Arrange
      req.user = {
        id: 'user123',
        role: 'user'
      };
      
      // Act
      authMiddleware.isAdmin(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Admin privileges required')
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('hasRole', () => {
    it('should call next() if user has required role', () => {
      // Arrange
      req.user = {
        id: 'user123',
        role: 'editor'
      };
      
      const middleware = authMiddleware.hasRole(['admin', 'editor']);
      
      // Act
      middleware(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user does not have required role', () => {
      // Arrange
      req.user = {
        id: 'user123',
        role: 'user'
      };
      
      const middleware = authMiddleware.hasRole(['admin', 'editor']);
      
      // Act
      middleware(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Required role')
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});