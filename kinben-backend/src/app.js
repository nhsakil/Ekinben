import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import compression from 'compression';

// Routes imports
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/products.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/orders.routes.js';
import userRoutes from './routes/users.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import reviewRoutes from './routes/reviews.routes.js';
import blogRoutes from './routes/blog.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
// import adminRoutes from './routes/admin.routes.js';

const app = express();

// ============== SECURITY MIDDLEWARE ==============

// Enhanced Helmet configuration for comprehensive security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || 'http://localhost:5173'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  // Prevent browsers from MIME-type sniffing
  noSniff: true,
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Enable XSS filter
  xssFilter: true,
  // Disable powered-by header
  hidePoweredBy: true,
  // Referrer policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Response compression middleware (gzip)
app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  level: 6 // Balance between speed and compression ratio
}));

// Request logging middleware
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Prevent parameter pollution
app.use((req, res, next) => {
  // Clean up query parameters - prevent duplicate parameter attacks
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = req.query[key][0];
    }
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    });
  }
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT',
        message: 'Too many authentication attempts, please try again later'
      }
    });
  },
  skipSuccessfulRequests: true // Don't count successful requests
});

// ============== ROUTES ==============

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'KINBEN API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (apply stricter rate limiting)
app.use('/api/auth', authLimiter, authRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Cart routes
app.use('/api/cart', cartRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// User routes
app.use('/api/users', userRoutes);

// Wishlist routes
app.use('/api/wishlist', wishlistRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);

// Blog routes
app.use('/api/blog', blogRoutes);

// Newsletter routes
app.use('/api/newsletter', newsletterRoutes);

// Admin routes
// app.use('/api/admin', adminRoutes);

// ============== ERROR HANDLING ==============

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Log error details (sensitive info excluded in production)
  console.error('Error:', {
    code: err.code,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Don't expose error details to client in production
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'An error occurred. Please try again later.'
        : message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  res.status(statusCode).json(errorResponse);
});

export default app;
