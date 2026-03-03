/**
 * API Response Optimization Middleware
 * Handles response compression, caching headers, and performance optimization
 */

import compression from 'compression';

/**
 * Create compression middleware with custom configuration
 * @returns {Function} Express middleware
 */
export const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  // Use dynamic compression level based on content type
  level: 6, // Balance between speed and compression ratio (0-9)
  // Filter compression by content type
  filter: (req, res) => {
    // Don't compress responses of certain types
    const type = res.get('content-type');
    if (type && type.includes('image')) {
      return false;
    }
    return compression.filter(req, res);
  }
});

/**
 * Cache control middleware for different response types
 * Implements HTTP caching headers for better performance
 */
export const cacheControlMiddleware = (req, res, next) => {
  // Cache GET requests for specific endpoints
  if (req.method === 'GET') {
    if (req.path.includes('/api/products')) {
      // Cache product listings for 5 minutes
      res.set('Cache-Control', 'public, max-age=300');
    } else if (req.path.includes('/api/blog')) {
      // Cache blog posts for 1 hour
      res.set('Cache-Control', 'public, max-age=3600');
    } else if (req.path.includes('/api/categories')) {
      // Cache categories for 24 hours (rarely changes)
      res.set('Cache-Control', 'public, max-age=86400');
    } else if (req.path.includes('/api/health')) {
      // Don't cache health checks
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  } else {
    // Don't cache non-GET responses (POST, PUT, DELETE, etc.)
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }

  next();
};

/**
 * ETag middleware for response validation
 * Allows clients to use ETags for conditional requests
 */
export const etagMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Generate simple ETag from response data
    const crypto = await import('crypto');
    const etag = crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');

    res.set('ETag', `"${etag}"`);

    // Check if client has matching ETag
    if (req.get('if-none-match') === `"${etag}"`) {
      res.status(304).end();
      return;
    }

    originalJson.call(this, data);
  };

  next();
};

/**
 * Response size optimization middleware
 * Strips unnecessary fields from responses
 */
export const responseOptimizationMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Add response size information in development
    if (process.env.NODE_ENV === 'development') {
      const size = JSON.stringify(data).length;
      res.set('X-Response-Size', `${size} bytes`);
    }

    // Add performance headers
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');

    originalJson.call(this, data);
  };

  next();
};

/**
 * Response time tracking middleware
 */
export const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Add response time header
    res.set('X-Response-Time', `${duration}ms`);

    // Log slow responses (> 1 second)
    if (duration > 1000) {
      console.warn(`[SLOW] ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
};

/**
 * Payload size limiter middleware
 * Prevents extremely large requests
 */
export const payloadSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const size = req.get('content-length');

    if (!size) {
      next();
      return;
    }

    const maxBytes = parseFloat(maxSize) * 1024 * 1024; // Convert MB to bytes
    const currentBytes = parseInt(size, 10);

    if (currentBytes > maxBytes) {
      res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Payload size exceeds maximum allowed size of ${maxSize}`
        }
      });
      return;
    }

    next();
  };
};

/**
 * Field filtering for API responses
 * Allows clients to request only specific fields
 */
export const fieldFilteringMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const fields = req.query.fields;

    if (fields && typeof fields === 'string') {
      const fieldList = fields.split(',').map(f => f.trim());

      if (Array.isArray(data)) {
        data = data.map(item => filterFields(item, fieldList));
      } else if (data && typeof data === 'object') {
        if (data.data) {
          if (Array.isArray(data.data)) {
            data.data = data.data.map(item => filterFields(item, fieldList));
          } else {
            data.data = filterFields(data.data, fieldList);
          }
        }
      }
    }

    originalJson.call(this, data);
  };

  next();
};

/**
 * Helper function to filter object fields
 */
function filterFields(obj, fields) {
  const filtered = {};

  fields.forEach(field => {
    if (field in obj) {
      filtered[field] = obj[field];
    }
  });

  return filtered;
}

/**
 * Combine all optimization middlewares
 */
export const apiOptimizationMiddleware = [
  compressionMiddleware,
  cacheControlMiddleware,
  responseTimeMiddleware,
  responseOptimizationMiddleware,
  fieldFilteringMiddleware
];

export default {
  compressionMiddleware,
  cacheControlMiddleware,
  etagMiddleware,
  responseOptimizationMiddleware,
  responseTimeMiddleware,
  payloadSizeLimiter,
  fieldFilteringMiddleware,
  apiOptimizationMiddleware
};
