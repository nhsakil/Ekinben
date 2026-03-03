/**
 * Structured Logging Service
 * Provides consistent JSON-formatted logging across the application
 */

import fs from 'fs';
import path from 'path';

const LOG_DIR = './logs';
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
};

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

class Logger {
  constructor(module) {
    this.module = module;
    this.level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'DEBUG' : 'INFO');
  }

  /**
   * Format log entry as JSON
   */
  formatLog(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      ...data,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Write log to file
   */
  writeToFile(level, logEntry) {
    const filename = path.join(LOG_DIR, `${level.toLowerCase()}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFileSync(filename, logLine, { encoding: 'utf-8' });

    // Also write to combined log
    const combinedFile = path.join(LOG_DIR, 'combined.log');
    fs.appendFileSync(combinedFile, logLine, { encoding: 'utf-8' });
  }

  /**
   * Log debug message
   */
  debug(message, data = {}) {
    const logEntry = this.formatLog('DEBUG', message, data);
    console.debug(JSON.stringify(logEntry));
    this.writeToFile('DEBUG', logEntry);
  }

  /**
   * Log info message
   */
  info(message, data = {}) {
    const logEntry = this.formatLog('INFO', message, data);
    console.info(JSON.stringify(logEntry));
    this.writeToFile('INFO', logEntry);
  }

  /**
   * Log warning message
   */
  warn(message, data = {}) {
    const logEntry = this.formatLog('WARN', message, data);
    console.warn(JSON.stringify(logEntry));
    this.writeToFile('WARN', logEntry);
  }

  /**
   * Log error message
   */
  error(message, error = null, data = {}) {
    const errorData = error instanceof Error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    } : {};

    const logEntry = this.formatLog('ERROR', message, {
      ...data,
      ...errorData
    });

    console.error(JSON.stringify(logEntry));
    this.writeToFile('ERROR', logEntry);
  }

  /**
   * Log critical error
   */
  critical(message, error = null, data = {}) {
    const errorData = error instanceof Error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    } : {};

    const logEntry = this.formatLog('CRITICAL', message, {
      ...data,
      ...errorData
    });

    console.error(JSON.stringify(logEntry));
    this.writeToFile('CRITICAL', logEntry);
  }

  /**
   * Log API request
   */
  logRequest(req, res) {
    const logEntry = this.formatLog('INFO', 'API Request', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      statusCode: res.statusCode,
      responseTime: req.responseTime
    });

    console.info(JSON.stringify(logEntry));
    this.writeToFile('INFO', logEntry);
  }

  /**
   * Log database query (for debugging)
   */
  logQuery(query, values = [], duration = 0) {
    if (process.env.NODE_ENV !== 'development') return; // Only in dev

    const logEntry = this.formatLog('DEBUG', 'Database Query', {
      query,
      values,
      duration: `${duration}ms`
    });

    console.debug(JSON.stringify(logEntry));
  }
}

/**
 * Create request timing middleware
 */
export const requestTimingMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    req.responseTime = `${Date.now() - start}ms`;
  });
  next();
};

/**
 * Create request logging middleware
 */
export const requestLoggingMiddleware = (logger) => {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const logEntry = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        ...(req.user && { userId: req.user.userId })
      };

      logger.info('Request completed', logEntry);
    });

    next();
  };
};

export const createLogger = (module) => new Logger(module);

export default Logger;
