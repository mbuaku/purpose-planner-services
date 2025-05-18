// Mock mongoose before importing any modules
const mockObjectId = jest.fn(() => '507f1f77bcf86cd799439011');
mockObjectId.toString = () => '507f1f77bcf86cd799439011';

const mockSave = jest.fn().mockImplementation(() => {
  const savedObj = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Event',
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      title: 'Test Event'
    })
  };
  return Promise.resolve(savedObj);
});

jest.mock('mongoose', () => {
  const mockSchema = function() {
    this.index = jest.fn();
    this.methods = {};
    this.statics = {};
    this.virtual = jest.fn(() => ({ get: jest.fn(), set: jest.fn() }));
    this.pre = jest.fn();
    this.post = jest.fn();
  };
  
  // Mock Types properly
  const Types = {
    ObjectId: mockObjectId
  };
  
  mockSchema.Types = Types;
  
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    connection: {
      on: jest.fn(),
      once: jest.fn(),
      close: jest.fn()
    },
    Schema: mockSchema,
    Types,
    model: jest.fn().mockImplementation((modelName) => {
      const MockModel = jest.fn().mockImplementation((data) => {
        const instance = {
          ...data,
          _id: '507f1f77bcf86cd799439011',
          save: mockSave,
          toObject: jest.fn().mockReturnValue({
            ...data,
            _id: '507f1f77bcf86cd799439011'
          })
        };
        return instance;
      });
      
      MockModel.find = jest.fn().mockResolvedValue([]);
      MockModel.findOne = jest.fn().mockResolvedValue(null);
      MockModel.findById = jest.fn().mockResolvedValue(null);
      MockModel.deleteOne = jest.fn().mockResolvedValue({ n: 1 });
      MockModel.updateOne = jest.fn().mockResolvedValue({ n: 1 });
      
      return MockModel;
    })
  };
});

// Mock the Event and RecurringEvent models
jest.mock('../../src/models/event.model', () => {
  const mockFind = jest.fn();
  const mockSave = jest.fn();
  
  const Event = jest.fn().mockImplementation((data) => {
    return {
      ...data,
      _id: '123',
      save: mockSave.mockResolvedValue({ ...data, _id: '123' }),
      toObject: jest.fn().mockReturnValue({ ...data, _id: '123' })
    };
  });
  
  Event.find = mockFind;
  Event.findById = jest.fn();
  Event.findByIdAndUpdate = jest.fn();
  Event.findByIdAndDelete = jest.fn();
  
  return Event;
});

jest.mock('../../src/models/recurring-event.model', () => {
  const RecurringEvent = jest.fn().mockImplementation((data) => {
    return {
      ...data,
      _id: '456',
      save: jest.fn().mockResolvedValue({ ...data, _id: '456' }),
      toObject: jest.fn().mockReturnValue({ ...data, _id: '456' })
    };
  });
  
  RecurringEvent.find = jest.fn();
  RecurringEvent.findById = jest.fn();
  
  return RecurringEvent;
});

const eventService = require('../../src/services/event.service');

describe('Event Service', () => {
  let mockUser;
  let mockEvent;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock data
    mockUser = {
      id: 'user123'
    };
    
    mockEvent = {
      title: 'Test Event',
      description: 'Test Description',
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 3600000), // 1 hour later
      category: 'personal',
      priority: 'medium'
    };
    
    // Setup in-memory database for testing
    global.inMemoryDB = {
      events: [],
      recurringEvents: []
    };
  });
  
  describe('createEvent', () => {
    it('should create a new event', async () => {
      // Act
      const result = await eventService.createEvent(mockEvent, mockUser.id);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(mockUser.id);
      expect(result.title).toBe(mockEvent.title);
      expect(global.inMemoryDB.events.length).toBe(1);
    });
    
    it('should throw an error if event data is invalid', async () => {
      // Arrange
      const invalidEvent = null; // Pass null to trigger error
      
      // Act & Assert
      await expect(eventService.createEvent(invalidEvent, mockUser.id))
        .rejects.toThrow();
    });
  });
  
  describe('getEvents', () => {
    beforeEach(() => {
      // Add some test events to in-memory DB
      global.inMemoryDB.events = [
        {
          _id: '1',
          userId: mockUser.id,
          title: 'Event 1',
          startTime: new Date('2023-01-01T10:00:00Z'),
          endTime: new Date('2023-01-01T11:00:00Z'),
          category: 'personal',
          priority: 'high',
          isCompleted: false
        },
        {
          _id: '2',
          userId: mockUser.id,
          title: 'Event 2',
          startTime: new Date('2023-01-02T10:00:00Z'),
          endTime: new Date('2023-01-02T11:00:00Z'),
          category: 'work',
          priority: 'medium',
          isCompleted: true
        },
        {
          _id: '3',
          userId: 'otherUser',
          title: 'Event 3',
          startTime: new Date('2023-01-01T10:00:00Z'),
          endTime: new Date('2023-01-01T11:00:00Z'),
          category: 'personal',
          priority: 'low',
          isCompleted: false
        }
      ];
    });
    
    it('should get all events for a user', async () => {
      // Act
      const result = await eventService.getEvents(mockUser.id);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(mockUser.id);
      expect(result[1].userId).toBe(mockUser.id);
    });
    
    it('should filter events by date range', async () => {
      // Act
      const result = await eventService.getEvents(mockUser.id, {
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-01-01T23:59:59Z'
      });
      
      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Event 1');
    });
    
    it('should filter events by category', async () => {
      // Act
      const result = await eventService.getEvents(mockUser.id, {
        category: 'work'
      });
      
      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Event 2');
    });
    
    it('should filter events by completion status', async () => {
      // Act
      const result = await eventService.getEvents(mockUser.id, {
        isCompleted: true
      });
      
      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Event 2');
    });
  });
  
  // Add tests for other methods as needed
});