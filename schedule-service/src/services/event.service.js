const Event = require('../models/event.model');
const RecurringEvent = require('../models/recurring-event.model');
const moment = require('moment');
const { RRule } = require('rrule');

/**
 * Service class for handling event operations
 */
class EventService {
  /**
   * Create a new event
   * @param {Object} eventData - Event data to create
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Created event
   */
  async createEvent(eventData, userId) {
    try {
      // Add user ID to event data
      const newEvent = new Event({
        ...eventData,
        userId
      });

      // If using in-memory database
      if (global.inMemoryDB) {
        const savedEvent = {
          ...newEvent.toObject(),
          _id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        global.inMemoryDB.events.push(savedEvent);
        return savedEvent;
      }

      // Save to MongoDB
      return await newEvent.save();
    } catch (error) {
      throw new Error(`Error creating event: ${error.message}`);
    }
  }

  /**
   * Get events for a user
   * @param {String} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of events
   */
  async getEvents(userId, filters = {}) {
    try {
      const { startDate, endDate, category, priority, isCompleted } = filters;
      
      // Build query
      const query = { userId };
      
      // Date range filter
      if (startDate || endDate) {
        query.startTime = {};
        if (startDate) {
          query.startTime.$gte = new Date(startDate);
        }
        if (endDate) {
          query.endTime = { $lte: new Date(endDate) };
        }
      }
      
      // Other filters
      if (category) query.category = category;
      if (priority) query.priority = priority;
      if (isCompleted !== undefined) query.isCompleted = isCompleted;
      
      // If using in-memory database
      if (global.inMemoryDB) {
        return global.inMemoryDB.events.filter(event => {
          // Check userId match
          if (event.userId !== userId) return false;
          
          // Check date range
          if (startDate && new Date(event.startTime) < new Date(startDate)) return false;
          if (endDate && new Date(event.endTime) > new Date(endDate)) return false;
          
          // Check other filters
          if (category && event.category !== category) return false;
          if (priority && event.priority !== priority) return false;
          if (isCompleted !== undefined && event.isCompleted !== isCompleted) return false;
          
          return true;
        });
      }
      
      // Get from MongoDB
      const events = await Event.find(query).sort({ startTime: 1 });

      // If date range is provided, also include relevant recurring events
      if ((startDate || endDate) && !filters.excludeRecurring) {
        const recurringEvents = await this.getRecurringEventOccurrences(userId, {
          startDate: startDate || moment().subtract(1, 'year').toDate(),
          endDate: endDate || moment().add(1, 'year').toDate(),
          category,
          priority
        });
        
        // Combine regular and recurring events
        return [...events, ...recurringEvents];
      }
      
      return events;
    } catch (error) {
      throw new Error(`Error fetching events: ${error.message}`);
    }
  }

  /**
   * Get a single event by ID
   * @param {String} eventId - Event ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Event object
   */
  async getEventById(eventId, userId) {
    try {
      // If using in-memory database
      if (global.inMemoryDB) {
        const event = global.inMemoryDB.events.find(e => e._id === eventId && e.userId === userId);
        if (!event) {
          throw new Error('Event not found');
        }
        return event;
      }
      
      // Get from MongoDB
      const event = await Event.findOne({ _id: eventId, userId });
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    } catch (error) {
      throw new Error(`Error fetching event: ${error.message}`);
    }
  }

  /**
   * Update an event
   * @param {String} eventId - Event ID
   * @param {Object} updateData - Data to update
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(eventId, updateData, userId) {
    try {
      // If using in-memory database
      if (global.inMemoryDB) {
        const eventIndex = global.inMemoryDB.events.findIndex(e => e._id === eventId && e.userId === userId);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }
        
        const updatedEvent = {
          ...global.inMemoryDB.events[eventIndex],
          ...updateData,
          updatedAt: new Date()
        };
        global.inMemoryDB.events[eventIndex] = updatedEvent;
        return updatedEvent;
      }
      
      // Update in MongoDB
      const event = await Event.findOneAndUpdate(
        { _id: eventId, userId },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!event) {
        throw new Error('Event not found');
      }
      
      return event;
    } catch (error) {
      throw new Error(`Error updating event: ${error.message}`);
    }
  }

  /**
   * Delete an event
   * @param {String} eventId - Event ID
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} Success status
   */
  async deleteEvent(eventId, userId) {
    try {
      // If using in-memory database
      if (global.inMemoryDB) {
        const eventIndex = global.inMemoryDB.events.findIndex(e => e._id === eventId && e.userId === userId);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }
        global.inMemoryDB.events.splice(eventIndex, 1);
        return true;
      }
      
      // Delete from MongoDB
      const result = await Event.findOneAndDelete({ _id: eventId, userId });
      if (!result) {
        throw new Error('Event not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Error deleting event: ${error.message}`);
    }
  }

  /**
   * Create a recurring event
   * @param {Object} eventData - Recurring event data
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Created recurring event
   */
  async createRecurringEvent(eventData, userId) {
    try {
      // Create RRule string if not provided
      if (!eventData.rrule) {
        const rule = new RRule({
          freq: this._getFrequencyValue(eventData.frequency),
          interval: eventData.interval || 1,
          byweekday: eventData.byWeekday ? this._parseWeekdays(eventData.byWeekday) : undefined,
          bymonthday: eventData.byMonthDay || undefined,
          bymonth: eventData.byMonth || undefined,
          bysetpos: eventData.bySetPosition || undefined,
          until: eventData.until || undefined,
          count: eventData.count || undefined,
          dtstart: new Date(eventData.startTime)
        });
        
        eventData.rrule = rule.toString();
      }
      
      // Add user ID to event data
      const newRecurringEvent = new RecurringEvent({
        ...eventData,
        userId
      });

      // If using in-memory database
      if (global.inMemoryDB) {
        const savedEvent = {
          ...newRecurringEvent.toObject(),
          _id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        global.inMemoryDB.recurringEvents.push(savedEvent);
        return savedEvent;
      }

      // Save to MongoDB
      return await newRecurringEvent.save();
    } catch (error) {
      throw new Error(`Error creating recurring event: ${error.message}`);
    }
  }

  /**
   * Get recurring events for a user
   * @param {String} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of recurring events
   */
  async getRecurringEvents(userId, filters = {}) {
    try {
      const { category, frequency } = filters;
      
      // Build query
      const query = { userId };
      
      // Other filters
      if (category) query.category = category;
      if (frequency) query.frequency = frequency;
      
      // If using in-memory database
      if (global.inMemoryDB) {
        return global.inMemoryDB.recurringEvents.filter(event => {
          // Check userId match
          if (event.userId !== userId) return false;
          
          // Check other filters
          if (category && event.category !== category) return false;
          if (frequency && event.frequency !== frequency) return false;
          
          return true;
        });
      }
      
      // Get from MongoDB
      return await RecurringEvent.find(query).sort({ startTime: 1 });
    } catch (error) {
      throw new Error(`Error fetching recurring events: ${error.message}`);
    }
  }

  /**
   * Get a single recurring event by ID
   * @param {String} eventId - Recurring event ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Recurring event object
   */
  async getRecurringEventById(eventId, userId) {
    try {
      // If using in-memory database
      if (global.inMemoryDB) {
        const event = global.inMemoryDB.recurringEvents.find(e => e._id === eventId && e.userId === userId);
        if (!event) {
          throw new Error('Recurring event not found');
        }
        return event;
      }
      
      // Get from MongoDB
      const event = await RecurringEvent.findOne({ _id: eventId, userId });
      if (!event) {
        throw new Error('Recurring event not found');
      }
      return event;
    } catch (error) {
      throw new Error(`Error fetching recurring event: ${error.message}`);
    }
  }

  /**
   * Update a recurring event
   * @param {String} eventId - Recurring event ID
   * @param {Object} updateData - Data to update
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Updated recurring event
   */
  async updateRecurringEvent(eventId, updateData, userId) {
    try {
      // Update RRule string if frequency-related fields are modified
      if (updateData.frequency || updateData.interval || updateData.byWeekday || 
          updateData.byMonthDay || updateData.byMonth || updateData.bySetPosition || 
          updateData.until || updateData.count || updateData.startTime) {
        
        // Get current event data
        const currentEvent = await this.getRecurringEventById(eventId, userId);
        
        // Create new RRule with updated values
        const rule = new RRule({
          freq: this._getFrequencyValue(updateData.frequency || currentEvent.frequency),
          interval: updateData.interval || currentEvent.interval || 1,
          byweekday: updateData.byWeekday ? this._parseWeekdays(updateData.byWeekday) : 
                    (currentEvent.byWeekday ? this._parseWeekdays(currentEvent.byWeekday) : undefined),
          bymonthday: updateData.byMonthDay || currentEvent.byMonthDay || undefined,
          bymonth: updateData.byMonth || currentEvent.byMonth || undefined,
          bysetpos: updateData.bySetPosition || currentEvent.bySetPosition || undefined,
          until: updateData.until || currentEvent.until || undefined,
          count: updateData.count || currentEvent.count || undefined,
          dtstart: new Date(updateData.startTime || currentEvent.startTime)
        });
        
        updateData.rrule = rule.toString();
      }
      
      // If using in-memory database
      if (global.inMemoryDB) {
        const eventIndex = global.inMemoryDB.recurringEvents.findIndex(e => e._id === eventId && e.userId === userId);
        if (eventIndex === -1) {
          throw new Error('Recurring event not found');
        }
        
        const updatedEvent = {
          ...global.inMemoryDB.recurringEvents[eventIndex],
          ...updateData,
          updatedAt: new Date()
        };
        global.inMemoryDB.recurringEvents[eventIndex] = updatedEvent;
        return updatedEvent;
      }
      
      // Update in MongoDB
      const event = await RecurringEvent.findOneAndUpdate(
        { _id: eventId, userId },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!event) {
        throw new Error('Recurring event not found');
      }
      
      return event;
    } catch (error) {
      throw new Error(`Error updating recurring event: ${error.message}`);
    }
  }

  /**
   * Delete a recurring event
   * @param {String} eventId - Recurring event ID
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} Success status
   */
  async deleteRecurringEvent(eventId, userId) {
    try {
      // If using in-memory database
      if (global.inMemoryDB) {
        const eventIndex = global.inMemoryDB.recurringEvents.findIndex(e => e._id === eventId && e.userId === userId);
        if (eventIndex === -1) {
          throw new Error('Recurring event not found');
        }
        global.inMemoryDB.recurringEvents.splice(eventIndex, 1);
        return true;
      }
      
      // Delete from MongoDB
      const result = await RecurringEvent.findOneAndDelete({ _id: eventId, userId });
      if (!result) {
        throw new Error('Recurring event not found');
      }
      
      // Delete all instances of this recurring event
      await Event.deleteMany({ recurringEventId: eventId, userId });
      
      return true;
    } catch (error) {
      throw new Error(`Error deleting recurring event: ${error.message}`);
    }
  }

  /**
   * Get occurrences of recurring events within a date range
   * @param {String} userId - User ID
   * @param {Object} filters - Filter options with startDate and endDate
   * @returns {Promise<Array>} List of event occurrences
   */
  async getRecurringEventOccurrences(userId, filters = {}) {
    try {
      const { startDate, endDate, category, priority } = filters;
      
      // Get all recurring events for user
      const recurringEvents = await this.getRecurringEvents(userId, { category, priority });
      
      // For each recurring event, calculate occurrences in the date range
      const allOccurrences = [];
      
      for (const event of recurringEvents) {
        // Skip archived events
        if (event.isArchived) continue;
        
        // Parse RRule
        const rule = RRule.fromString(event.rrule);
        
        // Calculate occurrences between dates
        const occurrences = rule.between(
          new Date(startDate || moment().subtract(1, 'month').toDate()),
          new Date(endDate || moment().add(2, 'months').toDate()),
          true // Include start and end dates
        );
        
        // Create event object for each occurrence
        for (const date of occurrences) {
          // Calculate duration from original event
          const originalStart = moment(event.startTime);
          const originalEnd = moment(event.endTime);
          const duration = originalEnd.diff(originalStart);
          
          // Apply same duration to this occurrence
          const occurrenceStart = moment(date);
          const occurrenceEnd = moment(date).add(duration, 'milliseconds');
          
          // Check for modifications to this specific occurrence
          const modification = event.modifications && event.modifications.find(
            mod => moment(mod.originalDate).isSame(occurrenceStart, 'day')
          );
          
          // Check for exceptions
          const isException = event.exdates && event.exdates.some(
            exdate => moment(exdate).isSame(occurrenceStart, 'day')
          );
          
          // Skip if this occurrence is an exception
          if (isException) continue;
          
          // Create occurrence event with modification if exists
          const occurrenceEvent = {
            _id: `${event._id}-${occurrenceStart.format('YYYYMMDD')}`,
            userId: event.userId,
            title: modification?.title || event.title,
            description: modification?.description || event.description,
            startTime: modification?.startTime || occurrenceStart.toDate(),
            endTime: modification?.endTime || occurrenceEnd.toDate(),
            category: event.category,
            location: modification?.location || event.location,
            priority: event.priority,
            isCompleted: false,
            isRecurring: true,
            recurringEventId: event._id,
            color: event.color,
            isVirtual: true, // Flag to indicate this is a calculated occurrence
            originalRecurringEvent: event
          };
          
          allOccurrences.push(occurrenceEvent);
        }
      }
      
      // Sort by start time
      return allOccurrences.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    } catch (error) {
      throw new Error(`Error calculating event occurrences: ${error.message}`);
    }
  }

  /**
   * Helper method to convert string frequency to RRule constant
   * @param {String} frequency - Frequency string (daily, weekly, etc.)
   * @returns {Number} RRule frequency constant
   * @private
   */
  _getFrequencyValue(frequency) {
    switch (frequency.toLowerCase()) {
      case 'daily': return RRule.DAILY;
      case 'weekly': return RRule.WEEKLY;
      case 'monthly': return RRule.MONTHLY;
      case 'yearly': return RRule.YEARLY;
      default: return RRule.WEEKLY;
    }
  }

  /**
   * Helper method to parse weekday strings into RRule weekday objects
   * @param {Array} weekdays - Array of weekday strings (MO, TU, etc.)
   * @returns {Array} Array of RRule weekday objects
   * @private
   */
  _parseWeekdays(weekdays) {
    const mapping = {
      'MO': RRule.MO,
      'TU': RRule.TU,
      'WE': RRule.WE,
      'TH': RRule.TH,
      'FR': RRule.FR,
      'SA': RRule.SA,
      'SU': RRule.SU
    };
    
    return weekdays.map(day => mapping[day]);
  }
}

module.exports = new EventService();