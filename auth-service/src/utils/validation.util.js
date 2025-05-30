// Google OAuth only - Minimal validation utilities

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user inputs
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove HTML tags
  const sanitized = input.replace(/<[^>]*>?/gm, '');
  
  // Trim whitespace
  return sanitized.trim();
}

module.exports = {
  isValidEmail,
  sanitizeInput,
};