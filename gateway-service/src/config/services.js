/**
 * Service configuration for proxying requests to microservices
 */
module.exports = {
  // Authentication Service
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '5000'),
    endpoints: ['/api/auth']
  },
  
  // Profile Service
  profile: {
    url: process.env.PROFILE_SERVICE_URL || 'http://localhost:3004',
    timeout: parseInt(process.env.PROFILE_SERVICE_TIMEOUT || '5000'),
    endpoints: ['/api/profile']
  },
  
  // Dashboard Service
  dashboard: {
    url: process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3006',
    timeout: parseInt(process.env.DASHBOARD_SERVICE_TIMEOUT || '5000'),
    endpoints: ['/api/dashboard']
  },
  
  // Financial Service
  financial: {
    url: process.env.FINANCIAL_SERVICE_URL || 'http://localhost:3002',
    timeout: parseInt(process.env.FINANCIAL_SERVICE_TIMEOUT || '5000'),
    endpoints: [
      '/api/financial',
      '/api/budget',
      '/api/expenses',
      '/api/income',
      '/api/savings-goals'
    ]
  },
  
  // Schedule Service
  schedule: {
    url: process.env.SCHEDULE_SERVICE_URL || 'http://localhost:3005',
    timeout: parseInt(process.env.SCHEDULE_SERVICE_TIMEOUT || '5000'),
    endpoints: ['/api/schedule', '/api/events']
  },
  
  // Spiritual Service
  spiritual: {
    url: process.env.SPIRITUAL_SERVICE_URL || 'http://localhost:3003',
    timeout: parseInt(process.env.SPIRITUAL_SERVICE_TIMEOUT || '5000'),
    endpoints: [
      '/api/spiritual',
      '/api/prayers',
      '/api/journal',
      '/api/bible-reading',
      '/api/prayer-session'
    ]
  }
};