const eventService = require('../services/event.service');

/**
 * Controller for handling event-related requests
 */
class EventController {
  /**
   * Create a new event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createEvent(req, res) {
    try {
      const userId = req.user.id;
      const eventData = req.body;
      
      const newEvent = await eventService.createEvent(eventData, userId);
      
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: {
          event: newEvent
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all events for a user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getEvents(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, category, priority, isCompleted } = req.query;
      
      const filters = {
        startDate,
        endDate,
        category,
        priority,
        isCompleted: isCompleted === 'true' ? true : (isCompleted === 'false' ? false : undefined)
      };
      
      const events = await eventService.getEvents(userId, filters);
      
      res.status(200).json({
        success: true,
        message: 'Events retrieved successfully',
        data: {
          events
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get a single event by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getEventById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const event = await eventService.getEventById(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Event retrieved successfully',
        data: {
          event
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update an event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateEvent(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedEvent = await eventService.updateEvent(id, updateData, userId);
      
      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: {
          event: updatedEvent
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete an event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteEvent(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      await eventService.deleteEvent(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create a new recurring event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createRecurringEvent(req, res) {
    try {
      const userId = req.user.id;
      const eventData = req.body;
      
      const newEvent = await eventService.createRecurringEvent(eventData, userId);
      
      res.status(201).json({
        success: true,
        message: 'Recurring event created successfully',
        data: {
          event: newEvent
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all recurring events for a user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getRecurringEvents(req, res) {
    try {
      const userId = req.user.id;
      const { category, frequency } = req.query;
      
      const filters = {
        category,
        frequency
      };
      
      const events = await eventService.getRecurringEvents(userId, filters);
      
      res.status(200).json({
        success: true,
        message: 'Recurring events retrieved successfully',
        data: {
          events
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get a single recurring event by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getRecurringEventById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const event = await eventService.getRecurringEventById(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Recurring event retrieved successfully',
        data: {
          event
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update a recurring event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateRecurringEvent(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedEvent = await eventService.updateRecurringEvent(id, updateData, userId);
      
      res.status(200).json({
        success: true,
        message: 'Recurring event updated successfully',
        data: {
          event: updatedEvent
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete a recurring event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteRecurringEvent(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      await eventService.deleteRecurringEvent(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Recurring event deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Mark an event as completed
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async completeEvent(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const updatedEvent = await eventService.updateEvent(id, { isCompleted: true }, userId);
      
      res.status(200).json({
        success: true,
        message: 'Event marked as completed',
        data: {
          event: updatedEvent
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get events for current day
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getTodayEvents(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const filters = {
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString()
      };
      
      const events = await eventService.getEvents(userId, filters);
      
      res.status(200).json({
        success: true,
        message: 'Today\'s events retrieved successfully',
        data: {
          events
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get events for current week
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getWeekEvents(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get first day of week (Sunday)
      const firstDay = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day;
      firstDay.setDate(diff);
      
      // Get last day of week (Saturday)
      const lastDay = new Date(firstDay);
      lastDay.setDate(lastDay.getDate() + 7);
      
      const filters = {
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString()
      };
      
      const events = await eventService.getEvents(userId, filters);
      
      res.status(200).json({
        success: true,
        message: 'Week\'s events retrieved successfully',
        data: {
          events,
          weekStart: firstDay,
          weekEnd: lastDay
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get events for current month
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getMonthEvents(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date();
      
      // Get first day of month
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Get first day of next month
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      
      const filters = {
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString()
      };
      
      const events = await eventService.getEvents(userId, filters);
      
      res.status(200).json({
        success: true,
        message: 'Month\'s events retrieved successfully',
        data: {
          events,
          monthStart: firstDay,
          monthEnd: lastDay
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new EventController();