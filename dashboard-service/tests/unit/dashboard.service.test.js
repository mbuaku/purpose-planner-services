const dashboardService = require('../../src/services/dashboard.service');

// Mock the Dashboard and Widget models
jest.mock('../../src/models/dashboard.model');
jest.mock('../../src/models/widget.model');

describe('Dashboard Service', () => {
  let mockUser;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock data
    mockUser = {
      id: 'user123'
    };
    
    // Setup in-memory database for testing
    global.inMemoryDB = {
      dashboards: [],
      widgets: []
    };
  });
  
  describe('getUserDashboard', () => {
    it('should create a default dashboard if none exists', async () => {
      // Act
      const result = await dashboardService.getUserDashboard(mockUser.id);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(mockUser.id);
      expect(result.isDefault).toBe(true);
      expect(Array.isArray(result.widgets)).toBe(true);
      expect(global.inMemoryDB.dashboards.length).toBe(1);
      expect(global.inMemoryDB.widgets.length).toBe(4); // Default widgets
    });
    
    it('should return existing dashboard', async () => {
      // Arrange
      const mockDashboard = {
        _id: 'dashboard1',
        userId: mockUser.id,
        name: 'Test Dashboard',
        isDefault: true,
        widgets: ['widget1', 'widget2']
      };
      
      const mockWidgets = [
        {
          _id: 'widget1',
          userId: mockUser.id,
          type: 'upcoming-events',
          title: 'Events',
          order: 0
        },
        {
          _id: 'widget2',
          userId: mockUser.id,
          type: 'budget-overview',
          title: 'Budget',
          order: 1
        }
      ];
      
      global.inMemoryDB.dashboards.push(mockDashboard);
      global.inMemoryDB.widgets.push(...mockWidgets);
      
      // Act
      const result = await dashboardService.getUserDashboard(mockUser.id);
      
      // Assert
      expect(result).toBeDefined();
      expect(result._id).toBe('dashboard1');
      expect(result.widgets).toHaveLength(2);
      expect(result.widgets[0]._id).toBe('widget1');
      expect(result.widgets[1]._id).toBe('widget2');
    });
  });
  
  describe('createOrUpdateDashboard', () => {
    it('should create a new dashboard with widgets', async () => {
      // Arrange
      const dashboardData = {
        name: 'New Dashboard',
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
      
      // Act
      const result = await dashboardService.createOrUpdateDashboard(mockUser.id, dashboardData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('New Dashboard');
      expect(result.widgets).toHaveLength(2);
      expect(result.widgets[0].type).toBe('spiritual-summary');
      expect(result.widgets[1].type).toBe('upcoming-events');
      expect(global.inMemoryDB.dashboards.length).toBe(1);
      expect(global.inMemoryDB.widgets.length).toBe(2);
    });
    
    it('should update an existing dashboard', async () => {
      // Arrange
      const existingDashboard = {
        _id: 'dashboard1',
        userId: mockUser.id,
        name: 'Old Dashboard',
        isDefault: true,
        widgets: ['widget1'],
        layout: { columns: 2, rows: 2 }
      };
      
      const existingWidget = {
        _id: 'widget1',
        userId: mockUser.id,
        type: 'upcoming-events',
        title: 'Events',
        order: 0
      };
      
      global.inMemoryDB.dashboards.push(existingDashboard);
      global.inMemoryDB.widgets.push(existingWidget);
      
      const updateData = {
        name: 'Updated Dashboard',
        layout: { columns: 3, rows: 2 }
      };
      
      // Act
      const result = await dashboardService.createOrUpdateDashboard(mockUser.id, updateData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Dashboard');
      expect(result.layout.columns).toBe(3);
      expect(result.widgets).toHaveLength(1);
      expect(result.widgets[0]._id).toBe('widget1');
    });
  });
  
  // Add tests for other methods as needed
});