const dashboardService = require('../services/dashboard.service');
const integrationService = require('../services/integration.service');
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

/**
 * Controller for handling dashboard-related requests
 */
class DashboardController {
  /**
   * Get user dashboard
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserDashboard(req, res) {
    try {
      const userId = req.user.id;
      
      const dashboard = await dashboardService.getUserDashboard(userId);
      
      res.status(200).json({
        success: true,
        message: 'Dashboard retrieved successfully',
        data: {
          dashboard
        }
      });
    } catch (error) {
      logger.error(`Get dashboard error: ${error.message}`, { stack: error.stack });
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create or update a dashboard
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createOrUpdateDashboard(req, res) {
    try {
      const userId = req.user.id;
      const dashboardData = req.body;
      
      const dashboard = await dashboardService.createOrUpdateDashboard(userId, dashboardData);
      
      res.status(200).json({
        success: true,
        message: 'Dashboard updated successfully',
        data: {
          dashboard
        }
      });
    } catch (error) {
      logger.error(`Update dashboard error: ${error.message}`, { stack: error.stack });
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get widget data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getWidgetData(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { range } = req.query;
      const useCache = req.useCache !== false;
      
      // Get widget
      const widget = await dashboardService.getWidgetById(id, userId);
      
      // If widget has cached data and cache is not stale and we should use cache
      if (widget.cachedData && !widget.isCacheStale() && useCache) {
        return res.status(200).json({
          success: true,
          message: 'Widget data retrieved from cache',
          data: {
            widget,
            widgetData: widget.cachedData,
            fromCache: true
          }
        });
      }
      
      // Get widget data from source service
      const widgetData = await integrationService.getWidgetData(widget, userId, range);
      
      // Update widget cache if method exists
      if (widget && typeof widget.updateCache === 'function') {
        await widget.updateCache(widgetData);
      }
      
      res.status(200).json({
        success: true,
        message: 'Widget data retrieved successfully',
        data: {
          widget,
          widgetData,
          fromCache: false
        }
      });
    } catch (error) {
      logger.error(`Get widget data error: ${error.message}`, { stack: error.stack });
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update a widget
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateWidget(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const widgetData = req.body;
      
      const widget = await dashboardService.updateWidget(id, widgetData, userId);
      
      res.status(200).json({
        success: true,
        message: 'Widget updated successfully',
        data: {
          widget
        }
      });
    } catch (error) {
      logger.error(`Update widget error: ${error.message}`, { stack: error.stack });
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete a widget
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteWidget(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      await dashboardService.deleteWidget(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Widget deleted successfully'
      });
    } catch (error) {
      logger.error(`Delete widget error: ${error.message}`, { stack: error.stack });
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Clear dashboard cache
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async clearDashboardCache(req, res) {
    try {
      const userId = req.user.id;
      
      dashboardService.clearCache(userId);
      
      res.status(200).json({
        success: true,
        message: 'Dashboard cache cleared successfully'
      });
    } catch (error) {
      logger.error(`Clear cache error: ${error.message}`, { stack: error.stack });
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Refresh all widget data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async refreshAllWidgets(req, res) {
    try {
      const userId = req.user.id;
      
      // Get dashboard
      const dashboard = await dashboardService.getUserDashboard(userId);
      
      // Process each widget
      const widgetPromises = dashboard.widgets.map(async (widget) => {
        try {
          // Get widget data from source service
          const widgetData = await integrationService.getWidgetData(widget, userId);
          
          // Update widget cache
          await dashboardService.updateWidget(
            widget._id, 
            { cachedData: widgetData, lastRefreshed: new Date() },
            userId
          );
          
          return {
            widgetId: widget._id,
            success: true
          };
        } catch (err) {
          return {
            widgetId: widget._id,
            success: false,
            error: err.message
          };
        }
      });
      
      const results = await Promise.all(widgetPromises);
      
      // Clear dashboard cache
      dashboardService.clearCache(userId);
      
      res.status(200).json({
        success: true,
        message: 'All widgets refreshed',
        data: {
          results
        }
      });
    } catch (error) {
      logger.error(`Refresh widgets error: ${error.message}`, { stack: error.stack });
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new DashboardController();