/**
 * Request Validation & Sanitization Middleware
 * Applies comprehensive input validation and sanitization to all endpoints
 */

import { validateAndSanitize, sanitizeString, sanitizeEmail } from '../utils/sanitizer.js';
import { AppError } from './errorHandler.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('validation-middleware');

/**
 * Auth request validation schema
 */
const authValidationSchema = {
  email: {
    type: 'email',
    required: true,
    minLength: 5,
    maxLength: 255,
    validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  },
  password: {
    type: 'string',
    required: true,
    minLength: 8,
    maxLength: 100,
    validate: (val) => /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(val),
    validateMessage: 'Password must contain uppercase, number, and special character'
  },
  firstName: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 100,
    validate: (val) => /^[a-zA-Z\s'-]+$/.test(val),
    validateMessage: 'First name can only contain letters, spaces, hyphens, and apostrophes'
  },
  lastName: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 100,
    validate: (val) => /^[a-zA-Z\s'-]+$/.test(val),
    validateMessage: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
  },
  phone: {
    type: 'string',
    required: false,
    minLength: 10,
    maxLength: 20,
    validate: (val) => /^[\d+\-\s()]+$/.test(val),
    validateMessage: 'Phone number format is invalid'
  }
};

/**
 * User profile validation schema
 */
const userProfileSchema = {
  firstName: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 100,
    validate: (val) => /^[a-zA-Z\s'-]+$/.test(val)
  },
  lastName: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 100,
    validate: (val) => /^[a-zA-Z\s'-]+$/.test(val)
  },
  phone: {
    type: 'string',
    required: false,
    minLength: 10,
    maxLength: 20
  },
  dateOfBirth: {
    type: 'string',
    required: false,
    validate: (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
    validateMessage: 'Date of birth must be in YYYY-MM-DD format'
  },
  gender: {
    type: 'string',
    required: false,
    validate: (val) => ['Male', 'Female', 'Other'].includes(val),
    validateMessage: 'Gender must be Male, Female, or Other'
  }
};

/**
 * Address validation schema
 */
const addressSchema = {
  label: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 50
  },
  firstName: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    validate: (val) => /^[a-zA-Z\s'-]+$/.test(val)
  },
  lastName: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    validate: (val) => /^[a-zA-Z\s'-]+$/.test(val)
  },
  phoneNumber: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 20
  },
  streetAddress: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 255,
    validate: (val) => /^[a-zA-Z0-9\s,.\-#]+$/.test(val),
    validateMessage: 'Street address format is invalid'
  },
  apartmentSuite: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  city: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    validate: (val) => /^[a-zA-Z\s'-]+$/.test(val)
  },
  stateProvince: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  postalCode: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 20,
    validate: (val) => /^[a-zA-Z0-9\s-]+$/.test(val)
  },
  country: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100
  },
  isDefaultShipping: {
    type: 'boolean',
    required: false
  },
  isDefaultBilling: {
    type: 'boolean',
    required: false
  }
};

/**
 * Product search validation schema
 */
const productSearchSchema = {
  search: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  category: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  minPrice: {
    type: 'number',
    required: false,
    options: { min: 0 }
  },
  maxPrice: {
    type: 'number',
    required: false,
    options: { min: 0 }
  },
  page: {
    type: 'number',
    required: false,
    options: { min: 1, isFloat: false }
  },
  limit: {
    type: 'number',
    required: false,
    options: { min: 1, max: 100, isFloat: false }
  },
  sort: {
    type: 'string',
    required: false,
    validate: (val) => ['name', 'price', 'rating', 'newest'].includes(val),
    validateMessage: 'Sort must be one of: name, price, rating, newest'
  },
  order: {
    type: 'string',
    required: false,
    validate: (val) => ['asc', 'desc'].includes(val),
    validateMessage: 'Order must be asc or desc'
  }
};

/**
 * Blog post validation schema
 */
const blogPostSchema = {
  title: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 255
  },
  slug: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 255,
    validate: (val) => /^[a-z0-9-]+$/.test(val),
    validateMessage: 'Slug must be lowercase alphanumeric with hyphens only'
  },
  excerpt: {
    type: 'string',
    required: false,
    maxLength: 500
  },
  content: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 50000
  },
  category: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  status: {
    type: 'string',
    required: false,
    validate: (val) => ['draft', 'published'].includes(val)
  },
  isFeatured: {
    type: 'boolean',
    required: false
  }
};

/**
 * Newsletter validation schema
 */
const newsletterSchema = {
  email: {
    type: 'email',
    required: true,
    maxLength: 255,
    validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  },
  name: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 255,
    validate: (val) => /^[a-zA-Z\s'-]+$/.test(val)
  }
};

/**
 * Review validation schema
 */
const reviewSchema = {
  productId: {
    type: 'uuid',
    required: true
  },
  rating: {
    type: 'number',
    required: true,
    options: { min: 1, max: 5, isFloat: false }
  },
  title: {
    type: 'string',
    required: false,
    minLength: 3,
    maxLength: 255
  },
  comment: {
    type: 'string',
    required: false,
    minLength: 10,
    maxLength: 2000
  }
};

/**
 * Generic validation middleware factory
 * @param {object} schema - Validation schema
 * @returns {Function} Express middleware
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate and sanitize request body
      const { isValid, data, errors } = validateAndSanitize(req.body, schema);

      if (!isValid) {
        logger.warn('Validation failed', {
          endpoint: req.path,
          method: req.method,
          errors
        });

        throw new AppError(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          errors
        );
      }

      // Replace body with sanitized data
      req.body = data;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Query parameter validation middleware
 * @param {object} schema - Validation schema for query params
 * @returns {Function} Express middleware
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const { isValid, data, errors } = validateAndSanitize(req.query, schema);

      if (!isValid) {
        logger.warn('Query validation failed', {
          endpoint: req.path,
          method: req.method,
          errors
        });

        throw new AppError(
          'Invalid query parameters',
          400,
          'INVALID_QUERY',
          errors
        );
      }

      // Replace query with sanitized data
      req.query = data;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * XSS Protection Middleware
 * Prevents XSS attacks by sanitizing HTML content
 */
export const xssProtection = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Remove potentially dangerous HTML tags and attributes
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }

  next();
};

/**
 * SQL Injection Protection Middleware
 * Already handled by parameterized queries, but this adds extra validation
 */
export const sqlInjectionProtection = (req, res, next) => {
  const sqlKeywords = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT)\b)/gi;

  const checkValue = (value) => {
    if (typeof value === 'string' && sqlKeywords.test(value)) {
      logger.warn('Potential SQL injection attempt detected', {
        endpoint: req.path,
        value: value.substring(0, 50)
      });
      throw new AppError(
        'Invalid input detected',
        400,
        'INVALID_INPUT'
      );
    }
  };

  if (req.body && typeof req.body === 'object') {
    for (const value of Object.values(req.body)) {
      checkValue(value);
    }
  }

  next();
};

/**
 * Combine all validation middleware
 */
export const allValidationMiddleware = [
  xssProtection,
  sqlInjectionProtection
];

// Export all schemas
export const validationSchemas = {
  authValidationSchema,
  userProfileSchema,
  addressSchema,
  productSearchSchema,
  blogPostSchema,
  newsletterSchema,
  reviewSchema
};

export default {
  validateRequest,
  validateQuery,
  xssProtection,
  sqlInjectionProtection,
  allValidationMiddleware,
  validationSchemas
};
