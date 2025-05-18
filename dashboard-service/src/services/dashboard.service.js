const Dashboard = require('../models/dashboard.model');
const Widget = require('../models/widget.model');
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
 * Service class for handling dashboard operations
 */
class DashboardService {
  /**
   * Get a user's dashboard
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Dashboard with widgets
   */
  async getUserDashboard(userId) {
    try {
      // Check cache first
      const cacheKey = `dashboard:${userId}`;
      const cachedDashboard = cache.get(cacheKey);
      
      if (cachedDashboard) {
        logger.info(`Retrieved dashboard from cache for user ${userId}`);
        return cachedDashboard;
      }
      
      // If using in-memory database
      if (global.inMemoryDB) {
        let dashboard = global.inMemoryDB.dashboards.find(d => d.userId === userId && d.isDefault);
        
        // If no dashboard exists, create a default one
        if (!dashboard) {
          dashboard = {
            _id: Date.now().toString(),
            userId,
            name: 'Main Dashboard',
            isDefault: true,
            layout: { columns: 2, rows: 2 },
            theme: 'system',
            widgets: [],
            lastAccessed: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          global.inMemoryDB.dashboards.push(dashboard);
          
          // Create default widgets
          const defaultWidgets = [
            {
              _id: `widget_${Date.now()}_1`,
              userId,
              type: 'spiritual-summary',
              title: 'Spiritual Summary',
              source: 'spiritual-service',
              icon: 'pray',
              position: 'top-left',
              order: 0
            },
            {
              _id: `widget_${Date.now()}_2`,
              userId,
              type: 'upcoming-events',
              title: 'Upcoming Events',
              source: 'schedule-service',
              icon: 'calendar',
              position: 'top-right',
              order: 1
            },
            {
              _id: `widget_${Date.now()}_3`,
              userId,
              type: 'budget-overview',
              title: 'Budget Overview',
              source: 'financial-service',
              icon: 'dollar-sign',
              position: 'bottom-left',
              order: 2,
              chartType: 'pie'
            },
            {
              _id: `widget_${Date.now()}_4`,
              userId,
              type: 'prayer-list',
              title: 'Prayer Requests',
              source: 'spiritual-service',
              icon: 'list',
              position: 'bottom-right',
              order: 3
            }
          ];
          
          global.inMemoryDB.widgets.push(...defaultWidgets);
          dashboard.widgets = defaultWidgets.map(w => w._id);
        }
        
        // Get widget details
        const widgets = global.inMemoryDB.widgets.filter(w => 
          dashboard.widgets.includes(w._id) && w.userId === userId
        );
        
        const result = {
          ...dashboard,
          widgets: widgets.sort((a, b) => a.order - b.order)
        };
        
        // Cache the result
        cache.set(cacheKey, result);
        
        return result;
      }
      
      // Get dashboard from MongoDB
      let dashboard = await Dashboard.findOne({ userId, isDefault: true });
      
      // If no dashboard exists, create a default one with widgets
      if (!dashboard) {
        dashboard = await Dashboard.create({
          userId,
          name: 'Main Dashboard',
          isDefault: true
        });
        
        // Create default widgets
        const widgets = await Widget.createDefaultWidgets(userId);
        
        // Add widget references to dashboard
        dashboard.widgets = widgets.map(w => w._id);
        await dashboard.save();
      }
      
      // Get widget details
      await dashboard.populate('widgets');
      
      // Sort widgets by order
      const sortedWidgets = [...dashboard.widgets];
      sortedWidgets.sort((a, b) => a.order - b.order);
      
      const result = dashboard.toObject();
      result.widgets = sortedWidgets;
      
      // Cache the result
      cache.set(cacheKey, result);
      
      // Update last accessed timestamp
      await dashboard.updateLastAccessed();
      
      return result;
    } catch (error) {
      logger.error(`Error getting user dashboard: ${error.message}`);
      throw new Error(`Error getting user dashboard: ${error.message}`);
    }
  }

  /**
   * Create or update a dashboard
   * @param {String} userId - User ID
   * @param {Object} dashboardData - Dashboard data
   * @returns {Promise<Object>} Updated or created dashboard
   */
  async createOrUpdateDashboard(userId, dashboardData) {
    try {
      // Get widgets data if included
      const { widgets, ...dashboardDetails } = dashboardData;
      
      // If using in-memory database
      if (global.inMemoryDB) {
        let dashboard = global.inMemoryDB.dashboards.find(d => d.userId === userId && d.isDefault);
        
        // Update or create dashboard
        if (dashboard) {
          Object.assign(dashboard, {
            ...dashboardDetails,
            updatedAt: new Date()
          });
        } else {
          dashboard = {
            _id: Date.now().toString(),
            userId,
            isDefault: true,
            ...dashboardDetails,
            widgets: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          global.inMemoryDB.dashboards.push(dashboard);
        }
        
        // Handle widgets if provided
        if (widgets && Array.isArray(widgets)) {
          // Clear existing widgets if needed
          global.inMemoryDB.widgets = global.inMemoryDB.widgets.filter(w => 
            !dashboard.widgets.includes(w._id)
          );
          
          dashboard.widgets = [];
          
          // Create new widgets
          const newWidgets = widgets.map((widget, index) => {
            const widgetId = `widget_${Date.now()}_${index}`;
            
            const newWidget = {
              _id: widgetId,
              userId,
              order: index,
              ...widget,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            global.inMemoryDB.widgets.push(newWidget);
            dashboard.widgets.push(widgetId);
            
            return newWidget;
          });
          
          // Clear cache
          cache.del(`dashboard:${userId}`);
          
          return {
            ...dashboard,
            widgets: newWidgets
          };
        }
        
        // Get widget details
        const dashboardWidgets = global.inMemoryDB.widgets.filter(w => 
          dashboard.widgets.includes(w._id) && w.userId === userId
        );
        
        // Clear cache
        cache.del(`dashboard:${userId}`);
        
        return {
          ...dashboard,
          widgets: dashboardWidgets.sort((a, b) => a.order - b.order)
        };
      }
      
      // Get dashboard from MongoDB or create new one
      let dashboard = await Dashboard.findOne({ userId, isDefault: true });
      
      if (!dashboard) {
        dashboard = new Dashboard({
          userId,
          isDefault: true,
          ...dashboardDetails
        });
      } else {
        // Update dashboard fields
        Object.keys(dashboardDetails).forEach(key => {
          dashboard[key] = dashboardDetails[key];
        });
      }
      
      // Handle widgets if provided
      if (widgets && Array.isArray(widgets)) {
        // Delete existing widgets
        if (dashboard.widgets && dashboard.widgets.length > 0) {
          await Widget.deleteMany({ _id: { $in: dashboard.widgets } });
        }
        
        dashboard.widgets = [];
        
        // Create new widgets
        const widgetPromises = widgets.map(async (widget, index) => {
          const newWidget = new Widget({
            userId,
            order: index,
            ...widget
          });
          
          const savedWidget = await newWidget.save();
          dashboard.widgets.push(savedWidget._id);
          
          return savedWidget;
        });
        
        const savedWidgets = await Promise.all(widgetPromises);
        
        // Save dashboard with widget references
        await dashboard.save();
        
        // Clear cache
        cache.del(`dashboard:${userId}`);
        
        // Return dashboard with widgets
        const result = dashboard.toObject();
        result.widgets = savedWidgets;
        
        return result;
      }
      
      // Save dashboard
      await dashboard.save();
      
      // Get widget details
      await dashboard.populate('widgets');
      
      // Sort widgets by order
      const sortedWidgets = [...dashboard.widgets];
      sortedWidgets.sort((a, b) => a.order - b.order);
      
      const result = dashboard.toObject();
      result.widgets = sortedWidgets;
      
      // Clear cache
      cache.del(`dashboard:${userId}`);
      
      return result;
    } catch (error) {
      logger.error(`Error creating/updating dashboard: ${error.message}`);
      throw new Error(`Error creating/updating dashboard: ${error.message}`);
    }
  }

  /**
   * Get a widget by ID
   * @param {String} widgetId - Widget ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Widget
   */
  async getWidgetById(widgetId, userId) {
    try {
      // Check cache first
      const cacheKey = `widget:${widgetId}`;
      const cachedWidget = cache.get(cacheKey);
      
      if (cachedWidget) {
        logger.info(`Retrieved widget from cache: ${widgetId}`);
        return cachedWidget;
      }
      
      // If using in-memory database
      if (global.inMemoryDB) {
        const widget = global.inMemoryDB.widgets.find(w => 
          w._id === widgetId && w.userId === userId
        );
        
        if (!widget) {
          throw new Error('Widget not found');
        }
        
        // Cache the result
        cache.set(cacheKey, widget);
        
        return widget;
      }
      
      // Get widget from MongoDB
      const widget = await Widget.findOne({ _id: widgetId, userId });
      
      if (!widget) {
        throw new Error('Widget not found');
      }
      
      // Cache the result
      cache.set(cacheKey, widget.toObject());
      
      return widget;
    } catch (error) {
      logger.error(`Error getting widget: ${error.message}`);
      throw new Error(`Error getting widget: ${error.message}`);
    }
  }

  /**
   * Update a widget
   * @param {String} widgetId - Widget ID
   * @param {Object} widgetData - Widget data to update
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Updated widget
   */
  async updateWidget(widgetId, widgetData, userId) {
    try {
      // If using in-memory database
      if (global.inMemoryDB) {
        const widgetIndex = global.inMemoryDB.widgets.findIndex(w => 
          w._id === widgetId && w.userId === userId
        );
        
        if (widgetIndex === -1) {
          throw new Error('Widget not found');
        }
        
        const updatedWidget = {
          ...global.inMemoryDB.widgets[widgetIndex],
          ...widgetData,
          updatedAt: new Date()
        };
        
        global.inMemoryDB.widgets[widgetIndex] = updatedWidget;
        
        // Clear caches
        cache.del(`widget:${widgetId}`);
        cache.del(`dashboard:${userId}`);
        
        return updatedWidget;
      }
      
      // Update widget in MongoDB
      const widget = await Widget.findOneAndUpdate(
        { _id: widgetId, userId },
        widgetData,
        { new: true, runValidators: true }
      );
      
      if (!widget) {
        throw new Error('Widget not found');
      }
      
      // Clear caches
      cache.del(`widget:${widgetId}`);
      cache.del(`dashboard:${userId}`);
      
      return widget;
    } catch (error) {
      logger.error(`Error updating widget: ${error.message}`);
      throw new Error(`Error updating widget: ${error.message}`);
    }
  }

  /**
   * Delete a widget
   * @param {String} widgetId - Widget ID
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} Success status
   */
  async deleteWidget(widgetId, userId) {
    try {
      // If using in-memory database
      if (global.inMemoryDB) {
        const widgetIndex = global.inMemoryDB.widgets.findIndex(w => 
          w._id === widgetId && w.userId === userId
        );
        
        if (widgetIndex === -1) {
          throw new Error('Widget not found');
        }
        
        // Remove widget
        global.inMemoryDB.widgets.splice(widgetIndex, 1);
        
        // Update dashboard
        const dashboard = global.inMemoryDB.dashboards.find(d => 
          d.userId === userId && d.isDefault
        );
        
        if (dashboard) {
          dashboard.widgets = dashboard.widgets.filter(id => id !== widgetId);
        }
        
        // Clear caches
        cache.del(`widget:${widgetId}`);
        cache.del(`dashboard:${userId}`);
        
        return true;
      }
      
      // Delete widget from MongoDB
      const widget = await Widget.findOneAndDelete({ _id: widgetId, userId });
      
      if (!widget) {
        throw new Error('Widget not found');
      }
      
      // Update dashboard
      await Dashboard.updateMany(
        { userId, widgets: widgetId },
        { $pull: { widgets: widgetId } }
      );
      
      // Clear caches
      cache.del(`widget:${widgetId}`);
      cache.del(`dashboard:${userId}`);
      
      return true;
    } catch (error) {
      logger.error(`Error deleting widget: ${error.message}`);
      throw new Error(`Error deleting widget: ${error.message}`);
    }
  }

  /**
   * Clear dashboard cache for a user
   * @param {String} userId - User ID
   */
  clearCache(userId) {
    cache.del(`dashboard:${userId}`);
    logger.info(`Cleared dashboard cache for user ${userId}`);
  }
}

module.exports = new DashboardService();