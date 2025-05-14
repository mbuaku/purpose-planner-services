const apicache = require('apicache');
const memoryCache = require('memory-cache');

// Create cache instance
const cache = apicache.options({
  appendKey: (req, res) => {
    // Include user ID in cache key if authenticated
    return req.user ? req.user.id : '';
  },
  headerBlacklist: ['authorization', 'cookie', 'set-cookie'],
  statusCodes: {
    include: [200]
  },
  debug: process.env.NODE_ENV === 'development'
}).middleware;

/**
 * Middleware for caching API responses
 * @param {Number} duration - Cache duration in seconds
 * @returns {Function} Middleware function
 */
const cacheMiddleware = (duration = 60) => {
  return cache(`${duration} seconds`);
};

/**
 * Clear cache for a specific route
 * @param {String} route - Route to clear cache for
 */
const clearCache = (route) => {
  apicache.clear(route);
};

/**
 * Clear all cache
 */
const clearAllCache = () => {
  apicache.clear();
};

/**
 * Clear cache for a specific user
 * @param {String} userId - User ID to clear cache for
 */
const clearUserCache = (userId) => {
  const cacheKeys = Object.keys(apicache.getIndex());
  cacheKeys.forEach(key => {
    if (key.includes(userId)) {
      apicache.clear(key);
    }
  });
};

/**
 * Custom memory cache middleware with more granular control
 * @param {Number} duration - Cache duration in seconds
 * @param {Function} keyGenerator - Function to generate cache key
 * @returns {Function} Middleware function
 */
const customCache = (duration = 60, keyGenerator = null) => {
  return (req, res, next) => {
    // Skip caching if noCache query param is set
    if (req.query.noCache === 'true') {
      return next();
    }

    // Generate cache key
    const key = keyGenerator ? 
      keyGenerator(req) : 
      `${req.originalUrl}:${req.user ? req.user.id : 'anonymous'}`;

    // Check if cached response exists
    const cachedResponse = memoryCache.get(key);
    if (cachedResponse) {
      // Set appropriate headers
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Expires', new Date(Date.now() + duration * 1000).toUTCString());
      
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json;

    // Override res.json method to cache response
    res.json = function(body) {
      // Cache response before sending
      memoryCache.put(key, body, duration * 1000);
      
      // Set appropriate headers
      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Expires', new Date(Date.now() + duration * 1000).toUTCString());
      
      // Call original json method
      return originalJson.call(this, body);
    };

    next();
  };
};

module.exports = cacheMiddleware;
module.exports.clearCache = clearCache;
module.exports.clearAllCache = clearAllCache;
module.exports.clearUserCache = clearUserCache;
module.exports.customCache = customCache;