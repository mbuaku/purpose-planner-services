const axios = require('axios');
const moment = require('moment');
const NodeCache = require('node-cache');
const winston = require('winston');

// Create logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Create a cache with 15-minute TTL
const cache = new NodeCache({ stdTTL: 900, checkperiod: 60 });

/**
 * Service class for integrating with other services for widget data
 */
class IntegrationService {
  constructor() {
    // Configure service URLs
    this.serviceUrls = {
      'spiritual-service': process.env.SPIRITUAL_SERVICE_URL || 'http://localhost:3003',
      'financial-service': process.env.FINANCIAL_SERVICE_URL || 'http://localhost:3002',
      'schedule-service': process.env.SCHEDULE_SERVICE_URL || 'http://localhost:3005',
      'profile-service': process.env.PROFILE_SERVICE_URL || 'http://localhost:3004'
    };
  }

  /**
   * Get data for a widget
   * @param {Object} widget - Widget to get data for
   * @param {String} userId - User ID
   * @param {String} range - Date range (day, week, month, year)
   * @returns {Promise<Object>} Widget data
   */
  async getWidgetData(widget, userId, range = 'month') {
    try {
      // Build cache key
      const cacheKey = `widget-data:${widget._id}:${range}`;
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        logger.info(`Retrieved widget data from cache for ${widget.type}`);
        return cachedData;
      }
      
      // Get data based on widget type
      let data;
      
      // Mock data for demo/development if no other services are available
      if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true') {
        data = this._getMockData(widget.type, range);
      } else {
        // Get real data from service
        switch (widget.type) {
          case 'spiritual-summary':
            data = await this._getSpiritualSummary(userId, range);
            break;
          case 'prayer-list':
            data = await this._getPrayerList(userId);
            break;
          case 'journal-entries':
            data = await this._getJournalEntries(userId, range);
            break;
          case 'upcoming-events':
            data = await this._getUpcomingEvents(userId, range);
            break;
          case 'habits-tracker':
            data = await this._getHabitsData(userId, range);
            break;
          case 'budget-overview':
            data = await this._getBudgetOverview(userId, range);
            break;
          case 'savings-goals':
            data = await this._getSavingsGoals(userId);
            break;
          case 'recent-expenses':
            data = await this._getRecentExpenses(userId, range);
            break;
          default:
            throw new Error(`Unsupported widget type: ${widget.type}`);
        }
      }
      
      // Cache the result
      cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      logger.error(`Error getting widget data: ${error.message}`);
      
      // Return error info so widget can display it
      return {
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get spiritual summary data
   * @param {String} userId - User ID
   * @param {String} range - Date range
   * @returns {Promise<Object>} Spiritual summary data
   * @private
   */
  async _getSpiritualSummary(userId, range) {
    try {
      const token = this._getServiceToken(userId);
      const dateRange = this._getDateRange(range);
      
      const response = await axios.get(
        `${this.serviceUrls['spiritual-service']}/api/spiritual/summary`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        }
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to get spiritual summary');
      }
    } catch (error) {
      logger.error(`Spiritual service error: ${error.message}`);
      
      // Fallback to mock data in case of error
      return this._getMockData('spiritual-summary', range);
    }
  }

  /**
   * Get prayer list data
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Prayer list data
   * @private
   */
  async _getPrayerList(userId) {
    try {
      const token = this._getServiceToken(userId);
      
      const response = await axios.get(
        `${this.serviceUrls['spiritual-service']}/api/prayers`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            limit: 10,
            isAnswered: false,
            sort: '-createdAt'
          }
        }
      );
      
      if (response.data && response.data.success) {
        return {
          prayers: response.data.data.prayers,
          count: response.data.data.totalCount
        };
      } else {
        throw new Error('Failed to get prayer list');
      }
    } catch (error) {
      logger.error(`Spiritual service error: ${error.message}`);
      
      // Fallback to mock data in case of error
      return this._getMockData('prayer-list');
    }
  }

  /**
   * Get journal entries data
   * @param {String} userId - User ID
   * @param {String} range - Date range
   * @returns {Promise<Object>} Journal entries data
   * @private
   */
  async _getJournalEntries(userId, range) {
    try {
      const token = this._getServiceToken(userId);
      const dateRange = this._getDateRange(range);
      
      const response = await axios.get(
        `${this.serviceUrls['spiritual-service']}/api/journal-entries`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            limit: 5,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            sort: '-createdAt'
          }
        }
      );
      
      if (response.data && response.data.success) {
        return {
          entries: response.data.data.entries,
          count: response.data.data.totalCount
        };
      } else {
        throw new Error('Failed to get journal entries');
      }
    } catch (error) {
      logger.error(`Spiritual service error: ${error.message}`);
      
      // Fallback to mock data in case of error
      return this._getMockData('journal-entries', range);
    }
  }

  /**
   * Get upcoming events data
   * @param {String} userId - User ID
   * @param {String} range - Date range
   * @returns {Promise<Object>} Upcoming events data
   * @private
   */
  async _getUpcomingEvents(userId, range) {
    try {
      const token = this._getServiceToken(userId);
      const dateRange = this._getDateRange(range);
      
      const response = await axios.get(
        `${this.serviceUrls['schedule-service']}/api/events`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            startDate: new Date().toISOString(),
            endDate: dateRange.endDate,
            sort: 'startTime'
          }
        }
      );
      
      if (response.data && response.data.success) {
        return {
          events: response.data.data.events.slice(0, 5), // Only take the first 5
          count: response.data.data.events.length
        };
      } else {
        throw new Error('Failed to get upcoming events');
      }
    } catch (error) {
      logger.error(`Schedule service error: ${error.message}`);
      
      // Fallback to mock data in case of error
      return this._getMockData('upcoming-events', range);
    }
  }

  /**
   * Get habits data
   * @param {String} userId - User ID
   * @param {String} range - Date range
   * @returns {Promise<Object>} Habits data
   * @private
   */
  async _getHabitsData(userId, range) {
    try {
      const token = this._getServiceToken(userId);
      const dateRange = this._getDateRange(range);
      
      const response = await axios.get(
        `${this.serviceUrls['schedule-service']}/api/habits/completion`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        }
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to get habits data');
      }
    } catch (error) {
      logger.error(`Schedule service error: ${error.message}`);
      
      // Fallback to mock data in case of error
      return this._getMockData('habits-tracker', range);
    }
  }

  /**
   * Get budget overview data
   * @param {String} userId - User ID
   * @param {String} range - Date range
   * @returns {Promise<Object>} Budget overview data
   * @private
   */
  async _getBudgetOverview(userId, range) {
    try {
      const token = this._getServiceToken(userId);
      const dateRange = this._getDateRange(range);
      
      const response = await axios.get(
        `${this.serviceUrls['financial-service']}/api/budget/summary`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        }
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to get budget overview');
      }
    } catch (error) {
      logger.error(`Financial service error: ${error.message}`);
      
      // Fallback to mock data in case of error
      return this._getMockData('budget-overview', range);
    }
  }

  /**
   * Get savings goals data
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Savings goals data
   * @private
   */
  async _getSavingsGoals(userId) {
    try {
      const token = this._getServiceToken(userId);
      
      const response = await axios.get(
        `${this.serviceUrls['financial-service']}/api/savings-goals`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        return {
          goals: response.data.data.goals,
          count: response.data.data.totalCount
        };
      } else {
        throw new Error('Failed to get savings goals');
      }
    } catch (error) {
      logger.error(`Financial service error: ${error.message}`);
      
      // Fallback to mock data in case of error
      return this._getMockData('savings-goals');
    }
  }

  /**
   * Get recent expenses data
   * @param {String} userId - User ID
   * @param {String} range - Date range
   * @returns {Promise<Object>} Recent expenses data
   * @private
   */
  async _getRecentExpenses(userId, range) {
    try {
      const token = this._getServiceToken(userId);
      const dateRange = this._getDateRange(range);
      
      const response = await axios.get(
        `${this.serviceUrls['financial-service']}/api/expenses`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            limit: 10,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            sort: '-date'
          }
        }
      );
      
      if (response.data && response.data.success) {
        return {
          expenses: response.data.data.expenses,
          count: response.data.data.totalCount,
          total: response.data.data.expenses.reduce((sum, e) => sum + e.amount, 0)
        };
      } else {
        throw new Error('Failed to get recent expenses');
      }
    } catch (error) {
      logger.error(`Financial service error: ${error.message}`);
      
      // Fallback to mock data in case of error
      return this._getMockData('recent-expenses', range);
    }
  }

  /**
   * Generate a JWT token for service-to-service communication
   * @param {String} userId - User ID to include in token
   * @returns {String} JWT token
   * @private
   */
  _getServiceToken(userId) {
    // In real implementation, you'd generate a token with service credentials
    // For now, we'll assume user's token is passed through
    // In production, use a proper service-to-service authentication mechanism
    return `service_token_${userId}`;
  }

  /**
   * Get start and end dates for a range
   * @param {String} range - Date range (day, week, month, year)
   * @returns {Object} Object with startDate and endDate
   * @private
   */
  _getDateRange(range) {
    const now = moment();
    let startDate, endDate;
    
    switch (range) {
      case 'day':
        startDate = now.clone().startOf('day');
        endDate = now.clone().endOf('day');
        break;
      case 'week':
        startDate = now.clone().startOf('week');
        endDate = now.clone().endOf('week');
        break;
      case 'month':
        startDate = now.clone().startOf('month');
        endDate = now.clone().endOf('month');
        break;
      case 'year':
        startDate = now.clone().startOf('year');
        endDate = now.clone().endOf('year');
        break;
      default:
        // Default to month
        startDate = now.clone().startOf('month');
        endDate = now.clone().endOf('month');
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }

  /**
   * Get mock data for development and testing
   * @param {String} widgetType - Type of widget
   * @param {String} range - Date range
   * @returns {Object} Mock data
   * @private
   */
  _getMockData(widgetType, range = 'month') {
    switch (widgetType) {
      case 'spiritual-summary':
        return {
          prayerCount: 12,
          answeredPrayerCount: 5,
          bibleReadingStreak: 8,
          journalEntryCount: 15,
          lastActivityDate: new Date().toISOString(),
          weeklyActivity: [
            { day: 'Monday', count: 3 },
            { day: 'Tuesday', count: 2 },
            { day: 'Wednesday', count: 4 },
            { day: 'Thursday', count: 1 },
            { day: 'Friday', count: 3 },
            { day: 'Saturday', count: 2 },
            { day: 'Sunday', count: 5 }
          ]
        };
        
      case 'prayer-list':
        return {
          prayers: [
            { _id: '1', title: 'Healing for Mom', category: 'intercession', createdAt: new Date() },
            { _id: '2', title: 'New job opportunity', category: 'supplication', createdAt: new Date() },
            { _id: '3', title: 'Church building project', category: 'intercession', createdAt: new Date() },
            { _id: '4', title: 'Wisdom for decisions', category: 'supplication', createdAt: new Date() },
            { _id: '5', title: 'Strength for challenges', category: 'supplication', createdAt: new Date() }
          ],
          count: 5
        };
        
      case 'journal-entries':
        return {
          entries: [
            { _id: '1', title: 'Morning Reflection', content: 'Today I reflected on Psalm 23...', createdAt: new Date() },
            { _id: '2', title: 'God\'s Faithfulness', content: 'I am grateful for God\'s faithfulness...', createdAt: new Date(Date.now() - 86400000) },
            { _id: '3', title: 'Prayer Insights', content: 'During prayer, I felt led to...', createdAt: new Date(Date.now() - 86400000 * 2) }
          ],
          count: 3
        };
        
      case 'upcoming-events':
        return {
          events: [
            { _id: '1', title: 'Church Service', startTime: moment().add(1, 'day').hour(9).minute(0).toISOString(), category: 'spiritual' },
            { _id: '2', title: 'Bible Study', startTime: moment().add(2, 'day').hour(18).minute(30).toISOString(), category: 'spiritual' },
            { _id: '3', title: 'Family Dinner', startTime: moment().add(3, 'day').hour(19).minute(0).toISOString(), category: 'personal' }
          ],
          count: 3
        };
        
      case 'habits-tracker':
        return {
          habits: [
            { name: 'Daily Prayer', completionRate: 0.85, streakDays: 12 },
            { name: 'Bible Reading', completionRate: 0.75, streakDays: 8 },
            { name: 'Journaling', completionRate: 0.6, streakDays: 4 },
            { name: 'Exercise', completionRate: 0.7, streakDays: 6 }
          ],
          overall: 0.73
        };
        
      case 'budget-overview':
        return {
          income: 5000,
          expenses: 3200,
          savings: 1800,
          savingsRate: 0.36,
          categories: [
            { name: 'Housing', amount: 1500, percentage: 0.47 },
            { name: 'Food', amount: 600, percentage: 0.19 },
            { name: 'Transport', amount: 400, percentage: 0.13 },
            { name: 'Utilities', amount: 300, percentage: 0.09 },
            { name: 'Entertainment', amount: 200, percentage: 0.06 },
            { name: 'Miscellaneous', amount: 200, percentage: 0.06 }
          ]
        };
        
      case 'savings-goals':
        return {
          goals: [
            { _id: '1', name: 'Emergency Fund', target: 10000, current: 6500, percentage: 0.65 },
            { _id: '2', name: 'Vacation', target: 3000, current: 1200, percentage: 0.4 },
            { _id: '3', name: 'New Car', target: 15000, current: 3000, percentage: 0.2 }
          ],
          count: 3
        };
        
      case 'recent-expenses':
        return {
          expenses: [
            { _id: '1', description: 'Grocery Shopping', amount: 85.75, category: 'Food', date: new Date() },
            { _id: '2', description: 'Electric Bill', amount: 120.50, category: 'Utilities', date: new Date(Date.now() - 86400000) },
            { _id: '3', description: 'Gas', amount: 45.00, category: 'Transport', date: new Date(Date.now() - 86400000 * 2) },
            { _id: '4', description: 'Restaurant', amount: 65.30, category: 'Food', date: new Date(Date.now() - 86400000 * 3) },
            { _id: '5', description: 'Internet', amount: 80.00, category: 'Utilities', date: new Date(Date.now() - 86400000 * 4) }
          ],
          count: 5,
          total: 396.55
        };
        
      default:
        return {
          error: true,
          message: `No mock data available for widget type: ${widgetType}`,
          timestamp: new Date().toISOString()
        };
    }
  }
}

module.exports = new IntegrationService();