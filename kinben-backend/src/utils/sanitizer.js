/**
 * Comprehensive Input Sanitization & Validation Utilities
 * Protects against XSS, SQL injection, and other security vulnerabilities
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize string input - removes scripts and dangerous HTML
 * @param {string} input - Raw string input
 * @returns {string} - Clean, safe string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;

  // Remove leading/trailing whitespace
  let clean = input.trim();

  // Remove null bytes
  clean = clean.replace(/\0/g, '');

  // Remove HTML tags and scripts
  clean = DOMPurify.sanitize(clean, { ALLOWED_TAGS: [] });

  return clean.substring(0, 10000); // Limit length
};

/**
 * Sanitize email address
 * @param {string} email - Email input
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';

  const clean = email.trim().toLowerCase();

  // Remove any non-email characters
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return '';
  }

  return clean.substring(0, 255);
};

/**
 * Sanitize numeric input
 * @param {number|string} input - Numeric input
 * @param {object} options - { min, max, isFloat }
 * @returns {number} - Sanitized number
 */
export const sanitizeNumber = (input, options = {}) => {
  const { min = -Infinity, max = Infinity, isFloat = false } = options;

  let num = isFloat ? parseFloat(input) : parseInt(input, 10);

  if (isNaN(num)) return null;
  if (num < min) num = min;
  if (num > max) num = max;

  return num;
};

/**
 * Sanitize UUID
 * @param {string} uuid - UUID string
 * @returns {string|null} - Sanitized UUID or null
 */
export const sanitizeUUID = (uuid) => {
  if (typeof uuid !== 'string') return null;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(uuid)) return null;

  return uuid.toLowerCase();
};

/**
 * Sanitize phone number - removes non-numeric characters
 * @param {string} phone - Phone number input
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhoneNumber = (phone) => {
  if (typeof phone !== 'string') return '';

  // Remove all non-digit characters except + and -
  const clean = phone.replace(/[^\d+\-\s]/g, '').trim();

  return clean.substring(0, 20);
};

/**
 * Sanitize URL
 * @param {string} url - URL input
 * @returns {string|null} - Sanitized URL or null
 */
export const sanitizeURL = (url) => {
  if (typeof url !== 'string') return null;

  try {
    const urlObj = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }

    return urlObj.toString();
  } catch {
    return null;
  }
};

/**
 * Sanitize object - recursively sanitize all string properties
 * @param {object} obj - Object to sanitize
 * @param {array} allowedKeys - Keys to sanitize (if null, sanitize all)
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj, allowedKeys = null) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip if key not in allowedKeys
    if (allowedKeys && !allowedKeys.includes(key)) {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, allowedKeys);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Validate and sanitize request body
 * @param {object} body - Request body
 * @param {object} schema - Validation schema { field: { type, sanitize, required } }
 * @returns {object} - { isValid, data, errors }
 */
export const validateAndSanitize = (body, schema) => {
  const errors = {};
  const data = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      isValid = false;
      continue;
    }

    if (value === undefined || value === null || value === '') {
      data[field] = null;
      continue;
    }

    // Type checking
    if (rules.type && typeof value !== rules.type) {
      errors[field] = `${field} must be of type ${rules.type}`;
      isValid = false;
      continue;
    }

    // Type-specific sanitization
    let sanitized = value;

    switch (rules.type) {
      case 'string':
        sanitized = sanitizeString(value);
        break;
      case 'email':
        sanitized = sanitizeEmail(value);
        if (!sanitized) {
          errors[field] = `${field} must be a valid email`;
          isValid = false;
        }
        break;
      case 'number':
        sanitized = sanitizeNumber(value, rules.options);
        if (sanitized === null) {
          errors[field] = `${field} must be a valid number`;
          isValid = false;
        }
        break;
      case 'uuid':
        sanitized = sanitizeUUID(value);
        if (!sanitized) {
          errors[field] = `${field} must be a valid UUID`;
          isValid = false;
        }
        break;
      default:
        sanitized = value;
    }

    // Length validation
    if (rules.minLength && sanitized.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`;
      isValid = false;
      continue;
    }

    if (rules.maxLength && sanitized.length > rules.maxLength) {
      errors[field] = `${field} must not exceed ${rules.maxLength} characters`;
      isValid = false;
      continue;
    }

    // Custom validation
    if (rules.validate && !rules.validate(sanitized)) {
      errors[field] = rules.validateMessage || `${field} is invalid`;
      isValid = false;
      continue;
    }

    data[field] = sanitized;
  }

  return { isValid, data, errors };
};

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return str.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Remove SQL wildcards to prevent SQL injection via LIKE
 * @param {string} str - String input
 * @returns {string} - String with SQL wildcards removed
 */
export const removeSQLWildcards = (str) => {
  if (typeof str !== 'string') return str;

  return str.replace(/[%_\\]/g, '');
};

export default {
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeUUID,
  sanitizePhoneNumber,
  sanitizeURL,
  sanitizeObject,
  validateAndSanitize,
  escapeHtml,
  removeSQLWildcards
};
