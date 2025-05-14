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
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and message
 */
function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  return {
    isValid: true,
    message: 'Password is strong',
  };
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

/**
 * Validate user registration input
 * @param {Object} userData - User data for registration
 * @returns {Object} - Validation result
 */
function validateUserRegistration(userData) {
  const errors = {};

  // Validate firstName
  if (!userData.firstName || userData.firstName.trim() === '') {
    errors.firstName = 'First name is required';
  } else if (userData.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  // Validate lastName
  if (!userData.lastName || userData.lastName.trim() === '') {
    errors.lastName = 'Last name is required';
  } else if (userData.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }

  // Validate email
  if (!userData.email || userData.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!isValidEmail(userData.email)) {
    errors.email = 'Please provide a valid email address';
  }

  // Validate password
  if (!userData.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = {
  isValidEmail,
  validatePasswordStrength,
  sanitizeInput,
  validateUserRegistration,
};